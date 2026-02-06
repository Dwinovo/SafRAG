package com.dwinovo.safrag.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private int code;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(StatusEnum.SUCCESS.getCode(), StatusEnum.SUCCESS.getMessage(), data);
    }
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(StatusEnum.SUCCESS.getCode(), message, data);
    }


    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }
    public static <T> ApiResponse<T> error(StatusEnum status, String message) {
        return new ApiResponse<>(status.getCode(), message, null);
    }

    public static <T> ApiResponse<T> error(StatusEnum status) {
        return new ApiResponse<>(status.getCode(), status.getMessage(), null);
    }
}


