package com.repository;

import com.entity.UserReview;
import com.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserReviewRepository extends JpaRepository<UserReview, Long> {
    List<UserReview> findByProduct(Product product);
}
