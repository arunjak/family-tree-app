package com.familytree.common;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

/**
 * Handles photo storage via Cloudinary.
 * Each person gets one photo slot: public_id = "family-tree/person_{personId}"
 * Uploading again auto-overwrites — no orphan files ever.
 */
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final long MAX_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final String FOLDER = "family-tree";

    private final Cloudinary cloudinary;

    public FileStorageService(@Value("${cloudinary.url}") String cloudinaryUrl) {
        this.cloudinary = new Cloudinary(cloudinaryUrl);
        this.cloudinary.config.secure = true;
    }

    /** Upload file → returns the Cloudinary secure HTTPS URL */
    @SuppressWarnings("unchecked")
    public String store(MultipartFile file, Long personId) {
        validate(file);
        try {
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", FOLDER + "/person_" + personId,
                            "overwrite", true,
                            "resource_type", "image"
                    )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new IllegalStateException("Cloudinary upload failed: " + e.getMessage());
        }
    }

    /** Delete photo for a person. Safe to call even if no photo exists. */
    public void delete(Long personId) {
        try {
            cloudinary.uploader().destroy(
                    FOLDER + "/person_" + personId,
                    ObjectUtils.asMap("resource_type", "image")
            );
        } catch (IOException ignored) {
            // best-effort — don't fail the request if Cloudinary delete fails
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new IllegalArgumentException("File is empty");
        if (file.getSize() > MAX_BYTES)
            throw new IllegalArgumentException("File must be under 5 MB");

        String name = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        int dot = name.lastIndexOf('.');
        String ext = dot >= 0 ? name.substring(dot + 1).toLowerCase() : "";
        if (!ALLOWED.contains(ext))
            throw new IllegalArgumentException("Only jpg, png, gif, webp allowed");
    }
}
