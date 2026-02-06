package com.dwinovo.safrag.controller;

import com.dwinovo.safrag.common.BusinessException;
import com.dwinovo.safrag.common.StatusEnum;
import com.dwinovo.safrag.pojo.Message;
import com.dwinovo.safrag.pojo.RagRetrieveResponse;
import com.dwinovo.safrag.service.MessageService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/agent")
@Slf4j
public class AgentController {

    @Autowired
    private ChatModel chatModel;

    @Autowired
    private MessageService messageService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${rag.server.host:}")
    private String ragServerHost;

    private static final long DEFAULT_TIMEOUT_MS = 0L; // 不超时，交给客户端关闭
    private static final int DEFAULT_RETRIEVE_TOP_K = 5;
    private static final String QA_INSTRUCTION = String.join("\n",
            "你是一名企业知识库问答助手，需要严格遵循以下要求：",
            "1. 依据提供的知识片段作答，不得编造、猜测或引用未出现的信息。",
            "2. 如果知识片段不足以支持答案，可以回复“抱歉，我不知道”，并可以建议用户补充信息。",
            "3. 你的分析和回答必须基于提供的知识片段",
            "3. 使用中文。");
    private static final String NO_CONTEXT_NOTICE = String.join("\n",
            "当前未检索到任何知识片段。",
            "请直接回复“抱歉，我不知道”，不得自行发挥。");


    @GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStreamGet(@RequestParam("conversationId") Long conversationId,
                                    @RequestParam("input") String userInput,
                                    @RequestParam(value = "knowledgeBaseIds", required = false) List<Long> knowledgeBaseIds,
                                    HttpServletRequest request,
                                    jakarta.servlet.http.HttpServletResponse response) {
        Claims claims = (Claims) request.getAttribute("jwtClaims");
        if (claims == null) throw new BusinessException(StatusEnum.UNAUTHORIZED);
        Long userId = Long.valueOf(claims.getSubject());

        List<Message> history = messageService.listConversationMessages(userId, conversationId);
    
        List<RagRetrieveResponse.RagNode> retrieveNodes = Collections.emptyList();
        try {
            retrieveNodes = retrieveContexts(userInput, knowledgeBaseIds);
        } catch (Exception ex) {
            log.warn("获取知识库上下文失败", ex);
        }
        final String finalUserInput = buildPromptWithContext(userInput, retrieveNodes);

        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT_MS);

        try {
            StringBuilder assistantBuffer = new StringBuilder();
            List<org.springframework.ai.chat.messages.Message> chatHistory = new ArrayList<>();
            if (history != null && !history.isEmpty()) {
                for (Message m : history) {
                    if (m.getRole() == null || m.getContent() == null) {
                        continue;
                    }
                    if ("user".equalsIgnoreCase(m.getRole())) {
                        chatHistory.add(new UserMessage(m.getContent()));
                    } else if ("assistant".equalsIgnoreCase(m.getRole())) {
                        chatHistory.add(new AssistantMessage(m.getContent()));
                    } else if ("system".equalsIgnoreCase(m.getRole())) {
                        chatHistory.add(new SystemMessage(m.getContent()));
                    }
                }
            }

            try {
                emitter.send(SseEmitter.event().name("message").data(""));
            } catch (IOException ignored) {
            }

            Flux<String> flux = ChatClient.create(chatModel)
                    .prompt()
                    .messages(chatHistory)
                    .user(finalUserInput)
                    .stream()
                    .content();

            Disposable subscription = flux.doOnNext(chunk -> {
                try {
                    assistantBuffer.append(chunk);
                    emitter.send(SseEmitter.event().name("message").data(chunk, MediaType.TEXT_PLAIN));
                } catch (IOException e) {
                    // 客户端断开连接,不再继续处理
                }
            }).doOnError(error -> {
                if (!(error instanceof IOException)) {
                    emitter.completeWithError(error);
                }
            }).doOnComplete(() -> {
                try {
                    String full = assistantBuffer.toString();
                    if (!full.isEmpty()) {
                        messageService.addMessage(userId, conversationId, "assistant", full);
                    }
                    emitter.send(SseEmitter.event().name("done").data("[DONE]"));
                    emitter.complete();
                } catch (IOException ex) {
                    // 客户端已断开,静默处理
                }
            }).subscribe();

            emitter.onCompletion(() -> {
                subscription.dispose();
                String partial = assistantBuffer.toString();
                if (!partial.isEmpty()) {
                    try {
                        List<Message> recent = messageService.listConversationMessages(userId, conversationId);
                        boolean alreadySaved = false;
                        if (recent != null && !recent.isEmpty()) {
                            Message lastMsg = recent.get(recent.size() - 1);
                            if ("assistant".equalsIgnoreCase(lastMsg.getRole())
                                    && partial.equals(lastMsg.getContent())) {
                                alreadySaved = true;
                            }
                        }
                        if (!alreadySaved) {
                            messageService.addMessage(userId, conversationId, "assistant", partial);
                        }
                    } catch (Exception ex) {
                        log.warn("保存助手部分回复时发生异常", ex);
                    }
                }
            });
            emitter.onTimeout(subscription::dispose);

        } catch (Exception e) {
            emitter.completeWithError(e);
        }
        return emitter;
    }

    private List<RagRetrieveResponse.RagNode> retrieveContexts(String userInput, List<Long> knowledgeBaseIds) {
        if (!StringUtils.hasText(ragServerHost) || restTemplate == null) {
            return Collections.emptyList();
        }
        if (CollectionUtils.isEmpty(knowledgeBaseIds)) {
            return Collections.emptyList();
        }

        String retrieveUrl = ragServerHost.endsWith("/") ? ragServerHost + "retrieve" : ragServerHost + "/retrieve";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>(4);
        payload.put("query_text", userInput);
        payload.put("allowed_knowledge_base_ids", knowledgeBaseIds);
        payload.put("top_k", DEFAULT_RETRIEVE_TOP_K);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        try {
            ResponseEntity<RagRetrieveResponse> response = restTemplate.postForEntity(retrieveUrl, entity, RagRetrieveResponse.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                return Collections.emptyList();
            }
            RagRetrieveResponse body = response.getBody();
            if (body == null || body.getCode() == null || body.getCode() != 200) {
                return Collections.emptyList();
            }
            if (body.getData() == null || body.getData().getNodes() == null) {
                return Collections.emptyList();
            }
            return body.getData().getNodes().stream()
                    .filter(node -> node.getContext() != null && !node.getContext().isEmpty())
                    .collect(Collectors.toList());
        } catch (HttpClientErrorException ex) {
            log.warn("调用 RAG 检索接口失败: {}", ex.getStatusCode(), ex);
            return Collections.emptyList();
        } catch (Exception ex) {
            log.warn("调用 RAG 检索接口异常", ex);
            return Collections.emptyList();
        }
    }

    private String buildPromptWithContext(String originalInput, List<RagRetrieveResponse.RagNode> nodes) {
        StringBuilder builder = new StringBuilder();
        builder.append(QA_INSTRUCTION).append("\n\n");
        if (nodes == null || nodes.isEmpty()) {
            builder.append(NO_CONTEXT_NOTICE).append("\n\n");
        } else {
            builder.append("以下是可参考的知识片段：\n");
            for (int i = 0; i < nodes.size(); i++) {
                RagRetrieveResponse.RagNode node = nodes.get(i);
                builder.append("【知识片段").append(i + 1).append("】\n");
                builder.append("Document ID: ").append(node.getDocumentId()).append("\n");
                builder.append(node.getContext()).append("\n\n");
            }
        }
        builder.append("用户问题：").append(originalInput);
        return builder.toString();
    }
}
