package com.amazingdeal.commerce.modules.catalog.repository;

import com.amazingdeal.commerce.modules.catalog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByActiveTrueOrderByDisplayOrderAsc();
    boolean existsBySlug(String slug);
}
