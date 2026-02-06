package com.dwinovo.safrag.config;

import com.dwinovo.safrag.pojo.S3Properties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
public class S3Config {

    @Autowired
    private S3Properties properties;

    @Bean
    public S3Client s3Client() {
        String endpointStr = properties.getEndpoint();
        if (!endpointStr.startsWith("http://") && !endpointStr.startsWith("https://")) {
            endpointStr = "https://" + endpointStr;
        }

        return S3Client.builder()
                .endpointOverride(URI.create(endpointStr))
                .region(Region.US_EAST_1) // MinIO requires a region, US_EAST_1 is standard default
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                properties.getUsername(),
                                properties.getPassword()
                        )
                ))
                // Enable path style access for MinIO
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .build();
    }
}
