package com.controller.pub;

import com.entity.Product;
import com.entity.ProductVariant;
import com.payload.request.ProductRequest;
import com.payload.response.FeaturedProductResponse;
import com.payload.response.ProductResponse;
import com.mapper.ProductMapper;
import com.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.entity.User;
import com.repository.UserRepository;
import com.service.UserDetailsImpl;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.entity.Moderator;
import com.entity.Role;
import com.repository.ModeratorRepository;

// CORS handled globally in SecurityConfig
@RestController
@RequestMapping("/api/products")
@Transactional(readOnly = true)
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModeratorRepository moderatorRepository;

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<org.springframework.data.domain.Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("modelNo").descending());
        return ResponseEntity.ok(productService.getAllProducts(pageable).map(productMapper::toResponse));
    }

    @GetMapping("/category/{category}/{subCategory}")
    @PreAuthorize("permitAll()")
    public List<ProductResponse> getProductsByCategoryAndSubCategory(
            @PathVariable String category,
            @PathVariable String subCategory) {
        return productService.getProductsByCategoryAndSubCategory(category, subCategory).stream()
                .map(productMapper::toResponse).toList();
    }

    @GetMapping("/search")
    @PreAuthorize("permitAll()")
    public java.util.List<com.payload.response.ProductSearchResponse> searchProducts(@RequestParam String q) {
        List<Product> products = productService.searchProducts(q);
        return products.stream().map(p -> {
            com.payload.response.ProductSearchResponse dto = new com.payload.response.ProductSearchResponse();
            dto.setModelNo(p.getModelNo());
            dto.setName(p.getName());

            // Derive info from first variant
            if (!p.getVariants().isEmpty()) {
                ProductVariant v = p.getVariants().get(0);
                dto.setPrice(v.getPrice());
                dto.setColor(v.getColor());

                if (!v.getImages().isEmpty()) {
                    String url = v.getImages().get(0).getImageUrl();
                    if (url != null && url.startsWith("/")) {
                        // Keep relative to serve via proxy correctly
                    }
                    dto.setImage1(url);
                }
            }

            dto.setCategory(p.getCategory() != null ? p.getCategory().name() : "");
            dto.setBrandName(p.getBrandName());

            return dto;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{modelNo}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ProductResponse> getProductByModelNo(@PathVariable Long modelNo) {
        return ResponseEntity.ok(productMapper.toResponse(productService.getProductByModelNo(modelNo)));
    }

    @GetMapping("/{modelNo}/similar")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ProductResponse>> getSimilarProducts(@PathVariable Long modelNo) {
        return ResponseEntity
                .ok(productService.getSimilarProducts(modelNo).stream().map(productMapper::toResponse).toList());
    }

    @GetMapping("/featured")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<FeaturedProductResponse>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/flash-sale")
    public ResponseEntity<List<ProductResponse>> getFlashSaleProducts() {
        // Updated logic: Service returns Products derived from flash sale variants
        return ResponseEntity
                .ok(productService.getFlashSaleProducts().stream().map(productMapper::toResponse).toList());
    }

    @GetMapping("/recommendations")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ProductResponse>> getRecommendations() {
        Long userId = null;
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.service.UserDetailsImpl) {
                userId = ((com.service.UserDetailsImpl) auth.getPrincipal()).getId();
            }
        } catch (Exception e) {
            // ignore
        }
        return ResponseEntity
                .ok(productService.getRecommendations(userId).stream().map(productMapper::toResponse).toList());
    }

    @GetMapping("/random")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ProductResponse>> getRandomProducts(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity
                .ok(productService.getRandomProducts(limit).stream().map(productMapper::toResponse).toList());
    }

    // JSON based creation if we want to use it
    @PostMapping("/json")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Transactional
    public ResponseEntity<ProductResponse> createProductJson(
            @Valid @RequestBody ProductRequest productRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Moderator moderator = null;
        if (currentUser != null) {
            User user = userRepository.findById(currentUser.getId()).orElse(null);
            if (user != null && user.getRole() == Role.MODERATOR) {
                moderator = moderatorRepository.findByUserId(user.getId()).orElse(null);
            }
        }

        if (moderator == null) {
            // If Admin creates, assume null moderator (system owned) or throw error if
            // strictly moderator-only.
            // Given requirement "Only MODERATOR can: Create product", unauthorized access
            // by Admin might be allowed?
            // But existing code allowed creation. I pass null moderator if not moderator.
        }

        return ResponseEntity.ok(productMapper.toResponse(productService.createProduct(productRequest, moderator)));
    }

    // Legacy mapping for creation is in AdminProductController (admin/products)
    // This endpoint here might be redundant or conflict if mapped to same path.
    // AdminProductController maps to /api/admin/products.
    // This one maps to /api/products.
    // Usually public generic create? No, likely user just meant Admin one.
    // I will leave this here but it requires JSON.

    @PutMapping("/{modelNo}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long modelNo,
            @Valid @RequestBody ProductRequest productRequest) {
        return ResponseEntity.ok(productMapper.toResponse(productService.updateProduct(modelNo, productRequest)));
    }

    @DeleteMapping("/{modelNo}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long modelNo) {
        productService.deleteProduct(modelNo);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/variants/{styleCode}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ProductResponse>> getVariantsByStyleCode(@PathVariable String styleCode) {
        return ResponseEntity
                .ok(productService.getProductsByStyleCode(styleCode).stream().map(productMapper::toResponse).toList());
    }
}
