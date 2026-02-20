package com.repository;

import com.entity.Product;
import com.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByName(String name);

    List<Product> findByCategory(Category category);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p JOIN p.moderator m JOIN m.user u WHERE u.id = :userId")
    List<Product> findByModerator_UserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    List<Product> findByNameContainingIgnoreCase(String name);

    long countByCategory(Category category);

    // Fallback search using DB
    // @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE
    // LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description)
    // LIKE LOWER(CONCAT('%', :query, '%'))")
    // List<Product>
    // searchFallback(@org.springframework.data.repository.query.Param("query")
    // String query);

    // Fetch one product per category (e.g. latest or high rated)
    Product findTopByCategoryOrderByModelNoDesc(Category category);

    // Find top products by rating
    List<Product> findTop10ByOrderByAverageRatingDesc();

    @org.springframework.data.jpa.repository.Query(value = "SELECT model_no FROM product ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Long> findRandomProductIds(@org.springframework.data.repository.query.Param("limit") int limit);
}
