package com.amazingdeal.commerce.modules.media.controller;

import com.amazingdeal.commerce.core.common.ApiResponse;
import com.amazingdeal.commerce.modules.media.service.MediaStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class MediaController {

    private final MediaStorageService mediaStorageService;

    public MediaController(MediaStorageService mediaStorageService) {
        this.mediaStorageService = mediaStorageService;
    }

    @PostMapping("/api/v1/media/upload")
    public ResponseEntity<ApiResponse<MediaStorageService.UploadResult>> uploadMedia(@RequestParam("file") MultipartFile file) {
        MediaStorageService.UploadResult result = mediaStorageService.store(file);
        return ResponseEntity.ok(ApiResponse.ok("File uploaded successfully", result));
    }

    @GetMapping("/media/{filename:.+}")
    public ResponseEntity<Resource> serveMedia(@PathVariable String filename) {
        Resource file = mediaStorageService.loadAsResource(filename);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

        if (filename.toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
            mediaType = MediaType.IMAGE_JPEG;
        } else if (filename.toLowerCase().endsWith(".webp")) {
            mediaType = MediaType.parseMediaType("image/webp");
        } else if (filename.toLowerCase().endsWith(".svg")) {
            mediaType = MediaType.parseMediaType("image/svg+xml");
        }

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
            .contentType(mediaType)
            .body(file);
    }
}
