package com.dwinovo.safrag.pojo;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "s3")
public class S3Properties {
    private String endpoint;
    private String publicEndpoint;
    private String username;
    private String password;
    private String bucketName;
}
