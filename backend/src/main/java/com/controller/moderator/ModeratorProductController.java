package com.controller.moderator;

import com.entity.Product;
import com.service.ProductService;
import com.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.payload.dto.ProductDto;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/moderator/products")
@PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN') or hasRole('EMPLOYEE')")
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class ModeratorProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private com.mapper.ProductMapper productMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/my")
    public ResponseEntity<?> getMyProducts(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        try {
            List<Product> products = productService.getProductsByModerator(currentUser.getId());
            return ResponseEntity.ok(products.stream().map(productMapper::toResponse).toList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new com.payload.response.MessageResponse(
                            "Error: " + e.getClass().getSimpleName() + ": " + e.getMessage()));
        }
    }

    @PostMapping(consumes = { "multipart/form-data" })
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> createProduct(
            @RequestPart("product") String productJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        try {
            ProductDto productDto = objectMapper.readValue(productJson, ProductDto.class);
            Product createdProduct = productService.addProductByModerator(
                    productDto,
                    files,
                    currentUser.getId());

            return ResponseEntity.ok(productMapper.toResponse(createdProduct));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new com.payload.response.MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/{modelNo}", consumes = { "multipart/form-data" })
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<com.payload.response.ProductResponse> updateProduct(
            @PathVariable Long modelNo,
            @RequestPart("product") String productJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserDetailsImpl currentUser) throws IOException {

        ProductDto productDto = objectMapper.readValue(productJson, ProductDto.class);

        Product updatedProduct = productService.updateProductByModerator(
                modelNo,
                productDto,
                files,
                currentUser.getId());

        return ResponseEntity.ok(productMapper.toResponse(updatedProduct));
    }
}
