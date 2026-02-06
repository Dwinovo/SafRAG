package com.dwinovo.safrag.utils;

import com.dwinovo.safrag.pojo.S3Properties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Component
public class OSSUtils {

    @Autowired
    private S3Client s3Client; // 注入S3 v2客户端

    @Autowired
    private S3Properties properties; // 注入通用S3配置

    public String uploadImage(MultipartFile file) {
        return uploadMultipart(file, "images");
    }

    public String uploadDocument(MultipartFile file) {
        return uploadMultipart(file, "documents");
    }

    public String uploadImage(byte[] data, String extension) {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("上传内容不能为空");
        }
        String normalizedExtension = (extension != null && extension.startsWith(".")) ? extension : ".jpg";
        return uploadBytes(data, normalizedExtension, "images");
    }

    private String uploadMultipart(MultipartFile file, String namespace) {
        String originalFilename = file.getOriginalFilename();
        String extension = ".bin";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        try {
            // SDK v2 支持直接从 InputStream 读取，无需手动提供 content length (如果是 RequestBody.fromInputStream 需要 length, 但 fromBytes 不需要)
            // 为了最佳性能并避免 Memory Overhead，如果能直接用 bytes 最好，但 multipart file可能很大
            // 这里我们用 RequestBody.fromInputStream, 它需要 size
            return uploadStream(file.getInputStream(), file.getSize(), file.getContentType(), namespace, extension);
        } catch (Exception e) {
            log.error("文件上传到S3失败", e);
            throw new RuntimeException("文件上传失败，请稍后重试", e);
        }
    }

    private String uploadBytes(byte[] data, String extension, String namespace) {
        String bucketName = properties.getBucketName();
        String normalizedExtension = (extension != null && extension.startsWith(".")) ? extension : ".dat";
        String objectName = namespace + "/" + UUID.randomUUID().toString() + normalizedExtension;

        try {
            PutObjectRequest putOb = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectName)
                    .contentType("image/jpeg")
                    .build();

            s3Client.putObject(putOb, RequestBody.fromBytes(data));
        } catch (Exception e) {
            log.error("字节数据上传到S3失败", e);
            throw new RuntimeException("文件上传失败，请稍后重试", e);
        }

        return buildUrl(bucketName, objectName);
    }

    private String uploadStream(InputStream inputStream, long size, String contentType, String namespace, String extension) {
        String bucketName = properties.getBucketName();
        String normalizedExtension = (extension != null && extension.startsWith(".")) ? extension : ".dat";
        String objectName = namespace + "/" + UUID.randomUUID().toString() + normalizedExtension;
        
        try {
            PutObjectRequest putOb = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectName)
                    .contentType(contentType)
                    .build();

            // v2: fromInputStream requires length for correct header
            s3Client.putObject(putOb, RequestBody.fromInputStream(inputStream, size));
        } catch (Exception e) {
            log.error("上传流到S3失败", e);
            throw new RuntimeException("文件上传失败，请稍后重试", e);
        }

        return buildUrl(bucketName, objectName);
    }

    private String buildUrl(String bucketName, String objectName) {
        // 构建访问 URL
        String urlBase = properties.getPublicEndpoint();
        if (urlBase == null || urlBase.isEmpty()) {
            urlBase = properties.getEndpoint();
        }
        
        if (urlBase.endsWith("/")) {
            urlBase = urlBase.substring(0, urlBase.length() - 1);
        }

        // 简单的判定逻辑：如果 urlBase 里不包含 bucketName，就拼上去 (Path Style)
        if (!urlBase.contains(bucketName)) {
             return urlBase + "/" + bucketName + "/" + objectName;
        } else {
             return urlBase + "/" + objectName;
        }
    }

    /**
     * 删除文件
     */
    public void delete(String url) {
        String bucketName = properties.getBucketName();
        String objectName = "";
        
        // 简单解析
        if (url.contains(bucketName + "/")) {
             objectName = url.substring(url.indexOf(bucketName + "/") + bucketName.length() + 1);
        } else {
             objectName = url.substring(url.lastIndexOf("/") + 1);
        }

        try {
            DeleteObjectRequest deleteReq = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectName)
                    .build();
            s3Client.deleteObject(deleteReq);
        } catch (Exception e) {
            log.error("从S3删除文件失败, objectName: {}", objectName, e);
            throw new RuntimeException("文件删除失败，请稍后重试", e);
        }
    }
}
