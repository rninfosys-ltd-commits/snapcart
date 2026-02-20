package com.service;

import com.entity.*;
import com.payload.request.ProductRequest;
import com.payload.request.ProductVariantRequest;
import com.payload.response.FeaturedProductResponse;
import com.repository.ProductRepository;
import com.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import com.payload.dto.ProductDto;
import com.payload.dto.ProductVariantDto;
import com.payload.dto.ProductImageDto;
import com.payload.dto.ProductAboutDto; // Import explicitly just in case
import com.util.FileStorageUtil;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private com.repository.OrderRepository orderRepository;

    @Autowired
    private com.repository.UserRepository userRepository;
    @Autowired
    private com.repository.ModeratorRepository moderatorRepository;

    @Autowired
    private FileStorageUtil fileStorageUtil;

    @Autowired
    private ProductAttributeService attributeService;

    public List<Product> getRecommendations(Long userId) {
        if (userId == null) {
            return productRepository.findAll();
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return productRepository.findAll();
        }

        Order lastOrder = orderRepository.findTopByUserOrderByOrderDateDesc(user);
        if (lastOrder != null && !lastOrder.getItems().isEmpty()) {
            ProductVariant variant = lastOrder.getItems().get(0).getVariant();
            if (variant != null && variant.getProduct() != null) {
                Product lastProduct = variant.getProduct();
                List<Product> similar = getSimilarProducts(lastProduct.getModelNo());
                if (similar.isEmpty()) {
                    return getProductsByCategory(lastProduct.getCategory()).stream().limit(8).toList();
                }
                return similar;
            }
        }
        return productRepository.findAll();
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public org.springframework.data.domain.Page<Product> getAllProducts(
            org.springframework.data.domain.Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public List<Product> getProductsByModerator(Long userId) {
        if (userId == null) {
            return new ArrayList<>();
        }
        try {
            // If the user is an EMPLOYEE, use their parentId (the moderator's userId)
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getRole() == com.entity.Role.EMPLOYEE) {
                Long parentId = user.getParentId();
                if (parentId == null) {
                    return new ArrayList<>();
                }
                return productRepository.findByModerator_UserId(parentId);
            }
            return productRepository.findByModerator_UserId(userId);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(ProductService.class)
                    .error("Error fetching products for moderator userId={}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    public Product getProductByModelNo(Long modelNo) {
        return productRepository.findById(Objects.requireNonNull(modelNo, "Model No is required"))
                .orElseThrow(() -> new RuntimeException("Product not found with model no: " + modelNo));
    }

    @Transactional
    public Product createProduct(ProductRequest request, Moderator moderator) {
        Product product = new Product();
        mapRequestToProduct(request, product);
        product.setModerator(moderator);

        Product savedProduct = productRepository.save(product);

        if (request.getVariants() != null) {
            for (ProductVariantRequest vr : request.getVariants()) {
                if (vr.getSizes() != null && !vr.getSizes().isEmpty()) {
                    for (String size : vr.getSizes()) {
                        ProductVariant variant = new ProductVariant();
                        variant.setProduct(savedProduct);
                        mapVariantRequest(vr, variant);
                        attributeService.syncAttributes(variant, vr.getColor(), vr.getColorHex(), size);
                        productVariantRepository.save(variant);
                    }
                } else {
                    ProductVariant variant = new ProductVariant();
                    variant.setProduct(savedProduct);
                    mapVariantRequest(vr, variant);
                    attributeService.syncAttributes(variant, vr.getColor(), vr.getColorHex(), vr.getSize());
                    productVariantRepository.save(variant);
                }
            }
        }

        return productRepository.save(savedProduct);
    }

    @Transactional
    public Product updateProduct(Long modelNo, ProductRequest request) {
        Product product = getProductByModelNo(modelNo);
        mapRequestToProduct(request, product);

        // Complex logic: Merge variants. For now, simple clear and add.
        // Orphan removal should handle delete.
        product.getVariants().clear();

        if (request.getVariants() != null) {
            for (ProductVariantRequest vr : request.getVariants()) {
                if (vr.getSizes() != null && !vr.getSizes().isEmpty()) {
                    for (String size : vr.getSizes()) {
                        ProductVariant variant = new ProductVariant();
                        variant.setProduct(product);
                        mapVariantRequest(vr, variant);
                        attributeService.syncAttributes(variant, vr.getColor(), vr.getColorHex(), size);
                        product.getVariants().add(variant);
                    }
                } else {
                    ProductVariant variant = new ProductVariant();
                    variant.setProduct(product);
                    mapVariantRequest(vr, variant);
                    attributeService.syncAttributes(variant, vr.getColor(), vr.getColorHex(), vr.getSize());
                    product.getVariants().add(variant);
                }
            }
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long modelNo) {
        productRepository.deleteById(Objects.requireNonNull(modelNo, "Model No is required"));
    }

    public List<Product> getProductsByCategory(Category category) {
        return productRepository.findAll().stream()
                .filter(p -> p.getCategory() == category)
                .toList();
    }

    public List<Product> getProductsByCategoryAndSubCategory(String category, String subCategory) {
        try {
            Category cat = Category.valueOf(category.toUpperCase());
            SubCategory subCat = SubCategory.valueOf(subCategory.toUpperCase());
            return productRepository.findAll().stream()
                    .filter(p -> p.getCategory() == cat && p.getSubCategory() == subCat)
                    .toList();
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    public List<Product> getProductsBySubCategory(SubCategory subCategory) {
        return productRepository.findAll().stream()
                .filter(p -> p.getSubCategory() == subCategory)
                .toList();
    }

    public long getTotalProductCount() {
        return productRepository.count();
    }

    public long countProductsByCategory(Category category) {
        return productRepository.findAll().stream()
                .filter(p -> p.getCategory() == category)
                .count();
    }

    public List<Product> searchProducts(String query) {
        // Return empty list or basic filter for now
        // return productRepository.searchFallback(query);
        return productRepository.findAll().stream()
                .filter(p -> p.getName().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }

    public List<Product> getSimilarProducts(Long modelNo) {
        Product sourceProduct = getProductByModelNo(modelNo);
        Category category = sourceProduct.getCategory();

        if (category == null) {
            return List.of();
        }

        return productRepository.findAll().stream()
                .filter(p -> p.getCategory() == category && !Objects.equals(p.getModelNo(), modelNo))
                .limit(4)
                .toList();
    }

    public List<Product> getRandomProducts(int limit) {
        List<Long> ids = productRepository.findRandomProductIds(limit);
        return productRepository.findAllById(ids);
    }

    @Transactional(readOnly = true)
    public List<FeaturedProductResponse> getFeaturedProducts() {
        List<FeaturedProductResponse> featured = new ArrayList<>();
        addFeatured(featured, Category.MEN);
        addFeatured(featured, Category.WOMEN);
        addFeatured(featured, Category.KIDS);
        addFeatured(featured, Category.ELECTRONICS);
        addFeatured(featured, Category.HOME_KITCHEN);
        addFeatured(featured, Category.BEAUTY);
        return featured;
    }

    private void addFeatured(List<FeaturedProductResponse> list, Category category) {
        try {
            Product p = productRepository.findTopByCategoryOrderByModelNoDesc(category);
            if (p != null && p.getCategory() != null) {
                FeaturedProductResponse dto = new FeaturedProductResponse();
                dto.setModelNo(p.getModelNo());
                dto.setName(p.getName());
                dto.setCategory(p.getCategory().name());

                if (!p.getVariants().isEmpty()) {
                    ProductVariant v = p.getVariants().get(0);
                    dto.setPrice(v.getPrice());
                    if (!v.getImages().isEmpty()) {
                        String url = v.getImages().get(0).getImageUrl();
                        if (url != null && url.startsWith("/")) {
                            // Keep relative to serve via proxy correctly
                        }
                        dto.setImageUrl(url);
                    }
                }

                list.add(dto);
            }
        } catch (Exception e) {
            // Log error but continue adding other categories to prevent 500 API failure
            System.err.println("Error adding featured product for category " + category + ": " + e.getMessage());
        }
    }

    private void mapRequestToProduct(ProductRequest request, Product product) {
        product.setName(request.getName());
        product.setBrandName(request.getBrandName());
        product.setCategory(request.getCategory());
        product.setSubCategory(request.getSubCategory());
        product.setProductGroup(request.getProductGroup());
        if (request.getAboutItems() != null) {
            product.setAboutItems(request.getAboutItems());
        }
        product.setManufacturer(request.getManufacturer());
        product.setPacker(request.getPacker());
        product.setImporter(request.getImporter());
        product.setItemWeight(request.getItemWeight());
        product.setItemDimensions(request.getItemDimensions());
        product.setNetQuantity(request.getNetQuantity());
        product.setGenericName(request.getGenericName());
        product.setDescription(request.getDescription());
        if (request.getIsSingleBrand() != null)
            product.setSingleBrand(request.getIsSingleBrand());
        if (request.getIsReturnable() != null)
            product.setReturnable(request.getIsReturnable());
        if (request.getIsReplaceable() != null)
            product.setReplaceable(request.getIsReplaceable());
    }

    private void mapVariantRequest(ProductVariantRequest vr, ProductVariant variant) {
        variant.setColor(vr.getColor());
        variant.setColorHex(vr.getColorHex());
        variant.setSize(vr.getSize());
        variant.setPrice(vr.getPrice());
        variant.setQuantity(vr.getQuantity());
        variant.setSku(vr.getSku());
        variant.setStyleCode(vr.getStyleCode());
        variant.setSalePrice(vr.getSalePrice());
        variant.setSaleEndTime(vr.getSaleEndTime());

        if (vr.getImageUrls() != null && !vr.getImageUrls().isEmpty()) {
            for (String url : vr.getImageUrls()) {
                ProductImage img = new ProductImage();
                img.setImageUrl(url);
                img.setVariant(variant);
                variant.getImages().add(img);
            }
        } else {
            // Add placeholder if no images provided
            ProductImage placeholder = new ProductImage();
            placeholder.setImageUrl("/assets/imagenotavailableplaceholder.png");
            placeholder.setVariant(variant);
            placeholder.setPrimary(true);
            variant.getImages().add(placeholder);
        }

        if (!variant.getImages().isEmpty() && variant.getImages().stream().noneMatch(ProductImage::isPrimary)) {
            variant.getImages().get(0).setPrimary(true);
        }
    }

    public List<Product> getFlashSaleProducts() {
        // Return derived products
        List<ProductVariant> variants = productVariantRepository.findBySaleEndTimeAfter(java.time.LocalDateTime.now());
        return variants.stream()
                .map(ProductVariant::getProduct)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<Product> getProductsByStyleCode(String styleCode) {
        // Filter by variants style code?
        // product.getVariants().stream().anyMatch(v ->
        // v.getStyleCode().equals(styleCode))
        // Doing this in memory for now.
        return productRepository.findAll().stream()
                .filter(p -> p.getVariants().stream().anyMatch(v -> Objects.equals(v.getStyleCode(), styleCode)))
                .toList();
    }

    public Product updateProductFields(Product product) {
        return productRepository.save(Objects.requireNonNull(product, "Product is required"));
    }

    @Transactional
    public Product addProductByModerator(ProductDto productDto, List<MultipartFile> files, Long userId) {
        // First verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // If EMPLOYEE, resolve to their parent moderator's userId
        if (user.getRole() == com.entity.Role.EMPLOYEE) {
            if (user.getParentId() == null) {
                throw new RuntimeException("Employee has no parent moderator assigned.");
            }
            Long parentId = user.getParentId();
            user = userRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent moderator user not found: " + parentId));
        }

        final User moderatorUser = user;
        final Long finalModeratorUserId = moderatorUser.getId();

        // Get or create moderator profile safely
        Moderator moderator = moderatorRepository.findByUserId(finalModeratorUserId).orElseGet(() -> {
            // Auto-create missing moderator profile to prevent 500 errors
            Moderator newMod = new Moderator();
            newMod.setUser(moderatorUser);
            newMod.setIsActive(true);
            newMod.setBrandName(moderatorUser.getName() + "'s Brand"); // Default brand name
            newMod.setAssignedBy(null); // Self-registered or system created
            newMod.setIsContractSigned(false);

            // Auto-grant permissions for new moderators
            newMod.setCanEditProducts(true);
            newMod.setCanManageOrders(true);
            newMod.setCanDeleteReviews(true);
            newMod.setIsBrandActive(true);

            return moderatorRepository.save(newMod);
        });

        if (!moderator.getCanEditProducts()) {
            throw new RuntimeException("Unauthorized: Moderator cannot add products.");
        }

        Product product = new Product();
        product.setModerator(moderator);

        return saveProductInternal(product, productDto, files);
    }

    @Transactional
    public Product updateProductByModerator(Long modelNo, ProductDto productDto, List<MultipartFile> files,
            Long userId) {
        Product product = getProductByModelNo(modelNo);

        // Resolve effective moderator userId (employees use their parentId)
        User user = userRepository.findById(userId).orElse(null);
        Long effectiveModeratorUserId = userId;
        if (user != null && user.getRole() == com.entity.Role.EMPLOYEE && user.getParentId() != null) {
            effectiveModeratorUserId = user.getParentId();
        }

        if (product.getModerator() == null
                || !product.getModerator().getUser().getId().equals(effectiveModeratorUserId)) {
            throw new RuntimeException("Unauthorized: You do not own this product.");
        }

        return saveProductInternal(product, productDto, files);
    }

    private Product saveProductInternal(Product product, ProductDto productDto, List<MultipartFile> files) {
        Map<String, MultipartFile> fileMap = files != null ? files.stream()
                .collect(Collectors.toMap(MultipartFile::getOriginalFilename, Function.identity(), (a, b) -> a))
                : Map.of();

        if (productDto.getName() != null)
            product.setName(productDto.getName());
        product.setPrice(productDto.getPrice());
        product.setQuantity(productDto.getQuantity());
        if (productDto.getDescription() != null)
            product.setDescription(productDto.getDescription());
        if (productDto.getBrandName() != null)
            product.setBrandName(productDto.getBrandName());
        if (productDto.getGenericName() != null)
            product.setGenericName(productDto.getGenericName());
        if (productDto.getImporter() != null)
            product.setImporter(productDto.getImporter());
        if (productDto.getManufacturer() != null)
            product.setManufacturer(productDto.getManufacturer());
        if (productDto.getPacker() != null)
            product.setPacker(productDto.getPacker());
        if (productDto.getItemDimensions() != null)
            product.setItemDimensions(productDto.getItemDimensions());
        if (productDto.getItemWeight() != null)
            product.setItemWeight(productDto.getItemWeight());
        if (productDto.getNetQuantity() != null)
            product.setNetQuantity(productDto.getNetQuantity());
        if (productDto.getCategory() != null)
            product.setCategory(productDto.getCategory());
        if (productDto.getSubCategory() != null)
            product.setSubCategory(productDto.getSubCategory());
        if (productDto.getProductGroup() != null)
            product.setProductGroup(productDto.getProductGroup());

        if (productDto.getIsReplaceable() != null)
            product.setReplaceable(productDto.getIsReplaceable());
        if (productDto.getIsReturnable() != null)
            product.setReturnable(productDto.getIsReturnable());
        if (productDto.getIsSingleBrand() != null)
            product.setSingleBrand(productDto.getIsSingleBrand());

        product.getAboutItems().clear();
        if (productDto.getAboutItems() != null) {
            for (ProductAboutDto about : productDto.getAboutItems()) {
                if (about.getAboutItem() != null && !about.getAboutItem().isEmpty()) {
                    product.getAboutItems().add(about.getAboutItem());
                }
            }
        }

        List<ProductVariantDto> variantDtos = productDto.getVariants() != null ? productDto.getVariants()
                : new ArrayList<>();
        List<Long> incomingIds = variantDtos.stream().map(ProductVariantDto::getId).filter(Objects::nonNull)
                .collect(Collectors.toList());

        try {
            product.getVariants().removeIf(v -> v.getId() != null && !incomingIds.contains(v.getId()));
        } catch (Exception e) {
        }

        for (ProductVariantDto vDto : variantDtos) {
            ProductVariant variant = null;
            if (vDto.getId() != null) {
                variant = product.getVariants().stream().filter(v -> v.getId().equals(vDto.getId())).findFirst()
                        .orElse(null);
            }

            if (variant == null) {
                variant = new ProductVariant();
                variant.setProduct(product);
                product.getVariants().add(variant);
            }

            variant.setPrice(vDto.getPrice());
            variant.setQuantity(vDto.getQuantity());

            // Sync both attribute system and legacy DB columns
            variant.setColor(vDto.getColor());
            variant.setColorHex(vDto.getColorHex());
            variant.setSize(vDto.getSize());

            attributeService.syncAttributes(variant, vDto.getColor(), vDto.getColorHex(), vDto.getSize());
            variant.setSku(vDto.getSku());
            variant.setStyleCode(vDto.getStyleCode());
            variant.setSalePrice(vDto.getSalePrice());

            if (vDto.getImages() != null) {
                variant.getImages().clear();
                for (ProductImageDto imgDto : vDto.getImages()) {
                    ProductImage img = new ProductImage();
                    img.setVariant(variant);
                    img.setPrimary(imgDto.getIsPrimary() != null && imgDto.getIsPrimary());
                    if (imgDto.getImageType() != null)
                        img.setImageType(imgDto.getImageType());

                    String imageUrl = imgDto.getImageUrl();
                    if (imageUrl != null && fileMap.containsKey(imageUrl)) {
                        MultipartFile file = fileMap.get(imageUrl);
                        String storedPath = fileStorageUtil.storeFile(file);
                        img.setImageUrl(storedPath);
                        img.setImageType(file.getContentType());
                    } else {
                        // Keep existing URL if valid, or set placeholder
                        if (imageUrl != null && !imageUrl.isEmpty()) {
                            img.setImageUrl(imageUrl);
                        } else {
                            img.setImageUrl("/assets/imagenotavailableplaceholder.png");
                        }
                    }
                    variant.getImages().add(img);
                }
            }
        }
        return productRepository.save(product);
    }
}
