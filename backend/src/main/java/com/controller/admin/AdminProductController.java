package com.controller.admin;

import com.entity.Product;
import com.entity.ProductImage;
import com.entity.ProductVariant;
import com.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import com.entity.User;
import com.repository.UserRepository;
import com.repository.ModeratorRepository;
import com.service.UserDetailsImpl;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class AdminProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.repository.ProductVariantRepository productVariantRepository;

    @Autowired
    private com.repository.ProductImageRepository productImageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModeratorRepository moderatorRepository;

    @Autowired
    private com.mapper.ProductMapper productMapper;

    @Autowired
    private com.service.ProductAttributeService attributeService;

    @PostMapping(consumes = "multipart/form-data")
    @Transactional
    public ResponseEntity<com.payload.response.ProductResponse> createProduct(
            @RequestParam String name,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String brandName,
            @RequestParam(required = false) String styleCode,
            @RequestParam(required = false) String colorHex,
            @RequestParam double price,
            @RequestParam int quantity,
            @RequestParam String category,
            @RequestParam(required = false) String productGroup,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false) List<String> sizes,
            @RequestParam(required = false) List<String> aboutItems,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) String packer,
            @RequestParam(required = false) String importer,
            @RequestParam(required = false) String itemWeight,
            @RequestParam(required = false) String itemDimensions,
            @RequestParam(required = false) String netQuantity,
            @RequestParam(required = false) String genericName,
            @RequestParam(required = false) String description,
            @RequestParam(required = false, defaultValue = "false") boolean isSingleBrand,
            @RequestPart(required = false) MultipartFile image1,
            @RequestPart(required = false) MultipartFile image2,
            @RequestPart(required = false) MultipartFile image3,
            @RequestPart(required = false) MultipartFile image4,
            @RequestPart(required = false) MultipartFile image5,
            @AuthenticationPrincipal UserDetailsImpl currentUser) throws IOException {

        try {
            User currentUserEntity = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            com.entity.Moderator moderator = null;
            if (currentUserEntity.getRole() == com.entity.Role.MODERATOR) {
                moderator = moderatorRepository.findByUserId(currentUser.getId()).orElse(null);

                if (moderator == null) {
                    // Auto-create missing moderator record for ease of use
                    moderator = new com.entity.Moderator();
                    moderator.setUser(currentUserEntity);
                    moderator.setCanEditProducts(true);
                    moderator.setCanDeleteReviews(false);
                    moderator.setCanBanUsers(false);
                    moderator.setCanManageOrders(false);
                    moderator.setIsActive(true);
                    moderator.setModerationLevel(1);
                    moderator.setAssignedAt(java.time.LocalDateTime.now());
                    moderator = moderatorRepository.save(moderator);
                    System.out.println("Auto-created missing Moderator record for user: " + currentUser.getEmail());
                }

                if (!moderator.getCanEditProducts()) {
                    System.err.println("403 Forbidden: Moderator " + currentUser.getEmail()
                            + " does not have canEditProducts permission.");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                if (!moderator.getCategories().isEmpty()) {
                    com.entity.Category prodCat = safeEnumValueOf(com.entity.Category.class, category);
                    if (prodCat == null || !moderator.getCategories().contains(prodCat)) {
                        System.err.println("403 Forbidden: Moderator " + currentUser.getEmail()
                                + " is not authorized for category: " + category);
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                }
            }

            Optional<Product> existingProductOpt = productRepository.findByName(name);
            Product product;

            if (existingProductOpt.isPresent()) {
                product = existingProductOpt.get();
                if (product.getModerator() != null && moderator != null) {
                    if (!product.getModerator().getId().equals(moderator.getId())) {
                        return ResponseEntity.status(HttpStatus.CONFLICT).build();
                    }
                }
            } else {
                product = new Product();
                product.setName(name);
                product.setBrandName(brandName);

                com.entity.Category cat = safeEnumValueOf(com.entity.Category.class, category);
                if (cat == null) {
                    throw new IllegalArgumentException("Invalid category: " + category);
                }
                product.setCategory(cat);

                product.setProductGroup(safeEnumValueOf(com.entity.ProductGroup.class, productGroup));
                product.setSubCategory(safeEnumValueOf(com.entity.SubCategory.class, subCategory));

                if (aboutItems != null)
                    product.setAboutItems(new ArrayList<>(aboutItems));

                product.setManufacturer(manufacturer);
                product.setPacker(packer);
                product.setImporter(importer);
                product.setItemWeight(itemWeight);
                product.setItemDimensions(itemDimensions);
                product.setNetQuantity(netQuantity);
                product.setGenericName(genericName);
                product.setDescription(description);
                product.setPrice(price);
                product.setQuantity(quantity);
                product.setSingleBrand(isSingleBrand);
                product.setModerator(moderator);

                product = productRepository.save(product);
            }

            Product savedProduct = product;
            List<String> sizeList = sizes != null && !sizes.isEmpty() ? sizes : List.of("Standard");
            String defaultColor = color != null && !color.trim().isEmpty() ? color : "Default";
            String defaultHex = colorHex != null && !colorHex.trim().isEmpty() ? colorHex : "#000000";

            for (String size : sizeList) {
                // Unique constraint check: model_no, color, size
                Optional<ProductVariant> existingVariant = savedProduct.getVariants().stream()
                        .filter(v -> Objects.equals(v.getSize(), size) && Objects.equals(v.getColor(), defaultColor))
                        .findFirst();

                ProductVariant v;
                if (existingVariant.isPresent()) {
                    v = existingVariant.get();
                } else {
                    v = new ProductVariant();
                    v.setProduct(savedProduct);
                    v.setStyleCode(styleCode);
                    v.setPrice(price);
                    v.setQuantity(quantity);
                    attributeService.syncAttributes(v, defaultColor, defaultHex, size);
                    v = productVariantRepository.save(v);
                    savedProduct.getVariants().add(v);
                }

                handleImages(v, image1, image2, image3, image4, image5);
            }

            Product finalProduct = productRepository.findById(savedProduct.getModelNo()).orElse(savedProduct);
            return ResponseEntity.ok(productMapper.toResponse(finalProduct));
        } catch (Exception e) {
            System.err.println("Error in createProduct: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private final java.nio.file.Path rootLocation = java.nio.file.Paths.get("uploads");

    private void handleImages(ProductVariant variant, MultipartFile... files) throws IOException {
        // Ensure directory exists
        if (!java.nio.file.Files.exists(rootLocation)) {
            java.nio.file.Files.createDirectories(rootLocation);
        }

        boolean hasUploaded = false;
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                ProductImage img = new ProductImage();
                img.setVariant(variant);

                // Save to File System
                String filename = java.util.UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                java.nio.file.Path destinationFile = rootLocation.resolve(filename).normalize().toAbsolutePath();

                // Security check: Verify file is within target directory
                if (!destinationFile.getParent().equals(rootLocation.toAbsolutePath())) {
                    throw new IOException("Cannot store file outside current directory.");
                }

                try (java.io.InputStream inputStream = file.getInputStream()) {
                    java.nio.file.Files.copy(inputStream, destinationFile);
                }

                img.setImageData(null); // Do not store BLOB
                img.setImageType(file.getContentType());
                img.setPrimary(variant.getImages().isEmpty());
                img.setImageUrl("/uploads/" + filename);

                productImageRepository.save(img); // Save with URL

                variant.getImages().add(img);
                hasUploaded = true;
            }
        }

        // If no images were uploaded, add the assets placeholder
        if (!hasUploaded && variant.getImages().isEmpty()) {
            ProductImage placeholder = new ProductImage();
            placeholder.setImageUrl("/assets/imagenotavailableplaceholder.png");
            placeholder.setVariant(variant);
            placeholder.setPrimary(true);
            productImageRepository.save(placeholder);
            variant.getImages().add(placeholder);
        }
    }

    @PostMapping("/{modelNo}/images")
    @Transactional
    public ResponseEntity<com.payload.response.ProductResponse> uploadImages(
            @PathVariable Long modelNo,
            @RequestPart("images") MultipartFile[] images,
            @AuthenticationPrincipal UserDetailsImpl currentUser) throws IOException {

        User currentUserEntity = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(modelNo)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Ownership check
        if (currentUserEntity.getRole() == com.entity.Role.MODERATOR) {
            if (product.getModerator() != null && !product.getModerator().getId().equals(currentUserEntity.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        if (images != null && images.length > 0) {
            for (ProductVariant v : product.getVariants()) {
                // Remove placeholder if it's the only image
                v.getImages().removeIf(img -> "/assets/imagenotavailableplaceholder.png".equals(img.getImageUrl()));

                handleImages(v, images);
            }
        }

        return ResponseEntity.ok(productMapper.toResponse(productRepository.save(product)));
    }

    @PutMapping(value = "/{modelNo}", consumes = "multipart/form-data")
    @Transactional
    public ResponseEntity<com.payload.response.ProductResponse> updateProduct(
            @PathVariable Long modelNo,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String colorHex,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) Integer quantity,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String productGroup,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false) List<String> sizes,
            @RequestParam(required = false) List<String> aboutItems,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) String packer,
            @RequestParam(required = false) String importer,
            @RequestParam(required = false) String itemWeight,
            @RequestParam(required = false) String itemDimensions,
            @RequestParam(required = false) String netQuantity,
            @RequestParam(required = false) String genericName,
            @RequestPart(required = false) MultipartFile image1,
            @RequestPart(required = false) MultipartFile image2,
            @RequestPart(required = false) MultipartFile image3,
            @RequestPart(required = false) MultipartFile image4,
            @RequestPart(required = false) MultipartFile image5,
            @AuthenticationPrincipal UserDetailsImpl currentUser) throws IOException {

        User currentUserEntity = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(modelNo)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // If user is MODERATOR, check permissions and ownership
        if (currentUserEntity.getRole() == com.entity.Role.MODERATOR) {
            com.entity.Moderator moderatorRecord = moderatorRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Moderator record not found"));

            if (!moderatorRecord.getCanEditProducts()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            if (product.getModerator() != null && !product.getModerator().getId().equals(moderatorRecord.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        // Update basic fields
        if (name != null)
            product.setName(name);
        if (price != null)
            product.setPrice(price);
        if (quantity != null)
            product.setQuantity(quantity);
        if (description != null)
            product.setDescription(description);

        com.entity.Category cat = safeEnumValueOf(com.entity.Category.class, category);
        if (cat != null)
            product.setCategory(cat);

        com.entity.ProductGroup group = safeEnumValueOf(com.entity.ProductGroup.class, productGroup);
        if (group != null)
            product.setProductGroup(group);

        com.entity.SubCategory sub = safeEnumValueOf(com.entity.SubCategory.class, subCategory);
        if (sub != null)
            product.setSubCategory(sub);

        // Update additional info
        if (manufacturer != null)
            product.setManufacturer(manufacturer);
        if (packer != null)
            product.setPacker(packer);
        if (importer != null)
            product.setImporter(importer);
        if (itemWeight != null)
            product.setItemWeight(itemWeight);
        if (itemDimensions != null)
            product.setItemDimensions(itemDimensions);
        if (netQuantity != null)
            product.setNetQuantity(netQuantity);
        if (genericName != null)
            product.setGenericName(genericName);

        if (aboutItems != null) {
            product.getAboutItems().clear();
            product.getAboutItems().addAll(aboutItems);
        }

        // --- Synchronize sizes/variants ---
        if (sizes != null && !sizes.isEmpty()) {

            // Remove variants not in the new sizes list
            try {
                product.getVariants().removeIf(v -> !sizes.contains(v.getSize()));
            } catch (Exception e) {
                // If deletion fails due to FK constraints, we keep them but they won't be
                // updated below
            }

            // Update existing and add missing
            for (String size : sizes) {
                if (size == null || size.trim().isEmpty())
                    continue;
                Optional<ProductVariant> existing = product.getVariants().stream()
                        .filter(var -> size.equals(var.getSize())).findFirst();

                ProductVariant v;
                if (existing.isPresent()) {
                    v = existing.get();
                } else {
                    v = new ProductVariant();
                    v.setProduct(product);
                    v.setSize(size);
                    // Standard values for new variant if not provided
                    v.setColor(color != null ? color : "Default");
                    v.setPrice(price != null ? price : 0.0);
                    v.setQuantity(quantity != null ? quantity : 0);

                    v = productVariantRepository.save(v);
                    product.getVariants().add(v);

                    // Copy existing images to the new variant if no new ones provided
                    if (image1 == null && image2 == null && image3 == null && image4 == null && image5 == null) {
                        for (com.entity.ProductImage originalImg : product.getVariants().get(0).getImages()) {
                            com.entity.ProductImage newImg = new com.entity.ProductImage();
                            newImg.setVariant(v);
                            newImg.setImageUrl(originalImg.getImageUrl());
                            newImg.setImageData(originalImg.getImageData());
                            newImg.setImageType(originalImg.getImageType());
                            newImg.setPrimary(originalImg.isPrimary());
                            v.getImages().add(newImg);
                        }
                    }
                }

                if (price != null)
                    v.setPrice(price);
                if (quantity != null)
                    v.setQuantity(quantity);

                attributeService.syncAttributes(v, color, colorHex, size);

                // Apply new images if uploaded
                if (image1 != null || image2 != null || image3 != null || image4 != null || image5 != null) {
                    v.getImages().clear();
                    handleImages(v, image1, image2, image3, image4, image5);
                }
            }
        } else {
            // If no sizes provided (should not happen with frontend), just update existing
            // ones
            for (ProductVariant v : product.getVariants()) {
                if (price != null)
                    v.setPrice(price);
                if (quantity != null)
                    v.setQuantity(quantity);

                attributeService.syncAttributes(v, color, colorHex, null);
                if (image1 != null || image2 != null || image3 != null || image4 != null || image5 != null) {
                    v.getImages().clear();
                    handleImages(v, image1, image2, image3, image4, image5);
                }
            }
        }

        Product saved = productRepository.save(product);
        return ResponseEntity.ok(productMapper.toResponse(saved));
    }

    @DeleteMapping("/{modelNo}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long modelNo) {
        Product product = productRepository.findById(
                Objects.requireNonNull(modelNo, "Model No is required"))
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
        return ResponseEntity.noContent().build();
    }

    private <T extends Enum<T>> T safeEnumValueOf(Class<T> enumType, String value) {
        if (value == null || value.isEmpty())
            return null;
        try {
            return Enum.valueOf(enumType, value.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
