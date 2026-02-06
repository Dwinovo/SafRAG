package com.dwinovo.safrag.utils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.batik.transcoder.TranscoderException;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.JPEGTranscoder;
import org.springframework.stereotype.Component;

/**
 * 与头像相关的图像处理工具。
 */
@Component
public class AvatarUtils {

    private static final float DEFAULT_JPEG_QUALITY = 0.95f;
    private static final int DEFAULT_SIZE = 512;

    /**
     * 将 SVG 二进制数据转换为指定尺寸的 JPEG 图片。
     *
     * @param svgData SVG 的二进制内容
     * @param width   目标宽度
     * @param height  目标高度
     * @return JPEG 二进制内容
     */
    public byte[] convertSvgToJpeg(byte[] svgData, int width, int height) {
        if (svgData == null || svgData.length == 0) {
            throw new IllegalArgumentException("SVG 数据不能为空");
        }
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(svgData);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            TranscoderInput input = new TranscoderInput(inputStream);
            TranscoderOutput output = new TranscoderOutput(outputStream);

            JPEGTranscoder transcoder = new JPEGTranscoder();
            transcoder.addTranscodingHint(JPEGTranscoder.KEY_QUALITY, DEFAULT_JPEG_QUALITY);
            transcoder.addTranscodingHint(JPEGTranscoder.KEY_WIDTH, (float) width);
            transcoder.addTranscodingHint(JPEGTranscoder.KEY_HEIGHT, (float) height);

            transcoder.transcode(input, output);
            outputStream.flush();
            return outputStream.toByteArray();
        } catch (TranscoderException | IOException e) {
            throw new RuntimeException("SVG 转换为 JPEG 时发生错误", e);
        }
    }

    /**
     * 将 SVG 二进制数据转换为默认尺寸 (512x512) 的 JPEG 图片。
     *
     * @param svgData SVG 的二进制内容
     * @return 生成的 JPEG 二进制内容
     */
    public byte[] convertSvgToJpeg(byte[] svgData) {
        return convertSvgToJpeg(svgData, DEFAULT_SIZE, DEFAULT_SIZE);
    }
}
