package com.demo.Demo.repository;

import com.demo.Demo.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
    List<Product>findByProductNameContainingIgnoreCase(String productName);
    List<Product> findByCategoryIgnoreCase(String category);
}
