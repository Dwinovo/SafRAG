package com.dwinovo.safrag;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

import static org.junit.jupiter.api.Assertions.*;
@Slf4j
@SpringBootTest
public class SpringAiChatTests {

    @Autowired
    private ChatModel chatModel;

    @Test
    void chatStreamOutput() {
        Flux<String> stream = ChatClient.create(chatModel)
                .prompt()
                .user("你是Gemini模型吗")
                .stream()
                .content();
        
        // 订阅流并输出
        stream.subscribe(
            chunk -> log.info("收到: {}", chunk),
            error -> log.error("错误: ", error),
            () -> log.info("流结束")
        );
    }
}


