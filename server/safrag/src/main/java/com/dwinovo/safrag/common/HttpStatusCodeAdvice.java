package com.dwinovo.safrag.common;

import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/**
 * 统一包装返回结果并根据业务码设置 HTTP 状态码。
 */
@ControllerAdvice
public class HttpStatusCodeAdvice implements ResponseBodyAdvice {

    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
    	// 可以指定拦截哪些类型
        return returnType.getParameterType().isAssignableFrom(ApiResponse.class);
    }


    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType,
                                  MediaType selectedContentType, Class selectedConverterType, ServerHttpRequest request,
                                  ServerHttpResponse response) {
        //取出后端响应结果 修改http状态码
        if(body != null) {
            int code = (int) ((ApiResponse) body).getCode();
            response.setStatusCode(resolveHttpStatus(code));
        }
        return body;
    }


    private HttpStatus resolveHttpStatus(int code) {
        if (code == StatusEnum.UNAUTHORIZED.getCode()) {
            return HttpStatus.UNAUTHORIZED;
        }
        if (code == StatusEnum.FORBIDDEN.getCode()) {
            return HttpStatus.FORBIDDEN;
        }
        if (code == StatusEnum.SERVER_ERROR.getCode()) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        if (code == StatusEnum.SUCCESS.getCode()) {
            return HttpStatus.OK;
        }
        if (code >= 40000 && code < 50000) {
            return HttpStatus.BAD_REQUEST;
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
