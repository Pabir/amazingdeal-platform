package com.amazingdeal.commerce.modules.catalog.controller;

import com.amazingdeal.commerce.core.common.ApiResponse;
import com.amazingdeal.commerce.core.common.PageResponse;
import com.amazingdeal.commerce.modules.catalog.dto.CategoryDto;
import com.amazingdeal.commerce.modules.catalog.dto.CreateCategoryRequest;
import com.amazingdeal.commerce.modules.catalog.dto.CreateProductRequest;
import com.amazingdeal.commerce.modules.catalog.dto.ProductDto;
import com.amazingdeal.commerce.modules.catalog.dto.UpdateProductRequest;
import com.amazingdeal.commerce.modules.catalog.service.CatalogService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminCatalogController {

    private final CatalogService catalogService;

    public AdminCatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    // Categories
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getActiveCategories()));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryDto created = catalogService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.ok("Category created successfully", created));
    }

    // Products
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        Sort sortObj = Sort.by(
            sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
            sortParts[0]
        );
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<ProductDto> products = catalogService.getAdminProducts(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(products)));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductDto created = catalogService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.ok("Product created successfully", created));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProduct(@PathVariable UUID id) {
        ProductDto product = catalogService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateProductRequest request
    ) {
        ProductDto updated = catalogService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", updated));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        catalogService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deleted successfully", null));
    }
}
