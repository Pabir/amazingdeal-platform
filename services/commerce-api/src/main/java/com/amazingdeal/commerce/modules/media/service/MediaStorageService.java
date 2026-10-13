package com.amazingdeal.commerce.modules.media.service;

import com.amazingdeal.commerce.core.common.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class MediaStorageService {

    private final Path uploadDir;
    private final String baseUrl;

    public MediaStorageService(
        @Value("${app.media.upload-dir:./uploads}") String uploadDir,
        @Value("${app.media.base-url:http://localhost:8080/media}") String baseUrl
    ) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.baseUrl = baseUrl;
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create media directory: " + this.uploadDir, e);
        }
    }

    public record UploadResult(
        String url,
        String filename,
        String contentType,
        long sizeBytes
    ) {}

    public UploadResult store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        String extension = "";
        int extIndex = originalFilename.lastIndexOf('.');
        if (extIndex > 0) {
            extension = originalFilename.substring(extIndex);
        }

        String storedFilename = UUID.randomUUID() + extension;
        Path targetLocation = this.uploadDir.resolve(storedFilename);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BadRequestException("Failed to save media file: " + ex.getMessage());
        }

        String fileUrl = baseUrl + "/" + storedFilename;
        return new UploadResult(fileUrl, storedFilename, file.getContentType(), file.getSize());
    }

    public Resource loadAsResource(String filename) {
        try {
            Path filePath = this.uploadDir.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new BadRequestException("File not found or unreadable: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new BadRequestException("Invalid file URL: " + filename);
        }
    }
}
