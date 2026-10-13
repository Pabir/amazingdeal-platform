package com.amazingdeal.commerce.modules.catalog.controller;

import com.amazingdeal.commerce.core.common.ApiResponse;
import com.amazingdeal.commerce.core.common.PageResponse;
import com.amazingdeal.commerce.modules.catalog.dto.CategoryDto;
import com.amazingdeal.commerce.modules.catalog.dto.ProductDto;
import com.amazingdeal.commerce.modules.catalog.service.CatalogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/storefront")
public class StorefrontCatalogController {

    private final CatalogService catalogService;

    public StorefrontCatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        List<CategoryDto> categories = catalogService.getActiveCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/categories/{slug}")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        CategoryDto category = catalogService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(category));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getProducts(
        @RequestParam(required = false) UUID categoryId,
        @RequestParam(required = false) Boolean featured,
        @RequestParam(required = false) String search,
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

        Page<ProductDto> products = catalogService.getStorefrontProducts(categoryId, featured, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(products)));
    }

    @GetMapping("/products/{slug}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductBySlug(@PathVariable String slug) {
        ProductDto product = catalogService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }
}
