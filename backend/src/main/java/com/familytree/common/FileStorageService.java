package com.familytree.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final long MAX_BYTES = 5 * 1024 * 1024; // 5 MB

    private final Path uploadDir;

    public FileStorageService(@Value("${file.upload-dir}") String dir) throws IOException {
        this.uploadDir = Paths.get(dir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    public String store(MultipartFile file, Long personId) {
        if (file.isEmpty()) throw new IllegalArgumentException("File is empty");
        if (file.getSize() > MAX_BYTES) throw new IllegalArgumentException("File must be under 5 MB");

        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String ext = extension(original).toLowerCase();
        if (!ALLOWED.contains(ext)) throw new IllegalArgumentException("Only jpg, png, gif, webp allowed");

        String filename = "person_" + personId + "_" + UUID.randomUUID() + "." + ext;
        try {
            Files.copy(file.getInputStream(), uploadDir.resolve(filename),
                    StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Could not save photo: " + e.getMessage());
        }
        return filename;
    }

    public void delete(String filename) {
        if (filename == null || filename.isBlank()) return;
        try {
            Path target = uploadDir.resolve(filename).normalize();
            if (target.startsWith(uploadDir)) Files.deleteIfExists(target);
        } catch (IOException ignored) {}
    }

    /** Extract just the filename from a stored photoUrl like /api/files/person_1_xxx.jpg */
    public String filenameFromUrl(String photoUrl) {
        if (photoUrl == null) return null;
        return photoUrl.substring(photoUrl.lastIndexOf('/') + 1);
    }

    public Path resolve(String filename) {
        return uploadDir.resolve(filename).normalize();
    }

    private String extension(String name) {
        int dot = name.lastIndexOf('.');
        return dot >= 0 ? name.substring(dot + 1) : "";
    }
}
