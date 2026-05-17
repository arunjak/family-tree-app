package com.familytree.common;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
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
 *
 * Optimization applied to every served URL:
 *   - c_fill + g_face  → square crop focused on face
 *   - w_500, h_500     → consistent size for profile cards
 *   - f_auto           → serves WebP/AVIF to modern browsers, JPEG to older
 *   - q_auto           → Cloudinary picks best quality/size ratio automatically
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

    /**
     * Upload original file → returns an optimized Cloudinary CDN URL.
     * The original is stored at full quality; transformations are applied
     * on-the-fly by Cloudinary's CDN and cached globally.
     */
    @SuppressWarnings("unchecked")
    public String store(MultipartFile file, Long personId) {
        validate(file);
        String publicId = FOLDER + "/person_" + personId;
        try {
            cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "overwrite", true,
                            "resource_type", "image"
                    )
            );
            // Build optimized delivery URL — original stored, transformations on CDN
            return optimizedUrl(publicId);
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

    /**
     * Builds a URL with:
     *  Step 1 — c_fill, g_face, w_500, h_500  (square crop, face-aware)
     *  Step 2 — f_auto, q_auto                (format + quality optimized)
     */
    private String optimizedUrl(String publicId) {
        return cloudinary.url()
                .secure(true)
                .transformation(new Transformation()
                        .width(500).height(500).crop("fill").gravity("face")
                        .chain()
                        .fetchFormat("auto").quality("auto"))
                .generate(publicId);
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
