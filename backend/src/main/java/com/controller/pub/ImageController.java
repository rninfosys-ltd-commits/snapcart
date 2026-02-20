package com.controller.pub;

import com.repository.ProductImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private ProductImageRepository productImageRepository;

    // @Autowired
    // private com.service.UserService userService;

    /**
     * Serve product image by ID
     */
    @GetMapping("/{imageId}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<byte[]> getImageById(@PathVariable Long imageId) {
        return productImageRepository.findById(imageId)
                .map(img -> {
                    // Public access to all images
                    return serveImage(img.getId());
                })
                .orElseGet(() -> servePlaceholder());
    }

    /**
     * Backward compatibility: /product/{modelNo}/{imageNum}
     * This is hard to map perfectly because modelNo -> variants -> images.
     * We will try to find the 'primary' variant's Nth image, or just fail
     * gracefully.
     * Actually, the frontend uses this URL constructed by Mappers.
     * The Mappers now construct: /api/images/product/{modelNo}/1
     * But we populated ImageUrl in Mappers as: /api/images/product/{modelNo}/1 ...
     * wait,
     * In mapper I wrote: "/api/images/product/" + p.getModelNo() + "/1"
     * I should change the mapper to point to the new ID-based endpoint:
     * /api/images/{imageId}
     * BUT, the mapper creates the URL string. I can change it now.
     * 
     * However, let's also try to support the old URL structure if possible,
     * or at least make the old URL structure redirect or fetch *some* image.
     */
    @Autowired
    private com.repository.ProductRepository productRepository;

    @GetMapping("/product/{modelNo}/{imageNum}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<byte[]> getProductImageLegacy(
            @PathVariable Long modelNo,
            @PathVariable int imageNum) {

        return productRepository.findById(modelNo)
                .map(product -> {
                    if (product.getVariants().isEmpty())
                        return null;

                    // Try to find the image across all variants, or just first one
                    // Frontend usually wants the first variant's images
                    com.entity.ProductVariant variant = product.getVariants().get(0);
                    if (variant.getImages().size() < imageNum)
                        return null;

                    com.entity.ProductImage image = variant.getImages().get(imageNum - 1);
                    return serveImage(image.getId());
                })
                .map(res -> res) // Unwrap from possible null in map
                .orElseGet(() -> servePlaceholder());
    }

    private final java.nio.file.Path uploadLocation = java.nio.file.Paths.get("uploads").toAbsolutePath().normalize();

    private ResponseEntity<byte[]> serveImage(Long imageId) {
        return productImageRepository.findById(imageId)
                .map(img -> {
                    byte[] data = img.getImageData();
                    String imageUrl = img.getImageUrl();

                    // If imageData is empty but imageUrl is present, try reading from disk
                    if ((data == null || data.length == 0) && imageUrl != null && imageUrl.startsWith("/uploads/")) {
                        try {
                            String fileName = imageUrl.substring("/uploads/".length());
                            java.nio.file.Path filePath = uploadLocation.resolve(fileName).normalize();
                            if (java.nio.file.Files.exists(filePath)) {
                                data = java.nio.file.Files.readAllBytes(filePath);
                            }
                        } catch (Exception e) {
                            // Fallback to placeholder if file read fails
                        }
                    }

                    if (data == null || data.length == 0) {
                        return servePlaceholder();
                    }

                    HttpHeaders headers = new HttpHeaders();
                    String mimeType = img.getImageType();

                    // Fallback to extension check if on disk and mimeType is missing/generic
                    if ((mimeType == null || mimeType.equals("application/octet-stream")) && imageUrl != null) {
                        if (imageUrl.toLowerCase().endsWith(".jpg") || imageUrl.toLowerCase().endsWith(".jpeg")) {
                            mimeType = "image/jpeg";
                        } else if (imageUrl.toLowerCase().endsWith(".png")) {
                            mimeType = "image/png";
                        } else if (imageUrl.toLowerCase().endsWith(".webp")) {
                            mimeType = "image/webp";
                        }
                    }

                    headers.setContentType(MediaType.parseMediaType(
                            mimeType != null ? mimeType : "image/jpeg"));
                    headers.setContentLength(data.length);
                    headers.setCacheControl("public, max-age=86400");

                    return new ResponseEntity<byte[]>(data, headers, HttpStatus.OK);
                })
                .orElseGet(() -> servePlaceholder());
    }

    private ResponseEntity<byte[]> servePlaceholder() {
        try {
            org.springframework.core.io.Resource resource = new org.springframework.core.io.ClassPathResource(
                    "static/assets/imagenotavailableplaceholder.png");
            if (resource.exists()) {
                byte[] data = resource.getInputStream().readAllBytes();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.IMAGE_PNG);
                headers.setContentLength(data.length);
                headers.setCacheControl("public, max-age=86400");
                return new ResponseEntity<>(data, headers, HttpStatus.OK);
            }
        } catch (Exception e) {
            // Log or ignore
        }
        // Final fallback to a reliable public UI placeholder
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, "https://placehold.co/600x600/e2e8f0/64748b?text=Image+Not+Found")
                .build();
    }
}
