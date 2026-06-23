package com.demo.Demo.service;

import com.demo.Demo.model.Product;
import com.demo.Demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
    public ResponseEntity<Product> addProduct(Product product) {
        Product saved = productRepository.save(product);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    public ResponseEntity<List<Product>> getAllProducts() {
        return new ResponseEntity<>(productRepository.findAll(),HttpStatus.OK);
    }

    public ResponseEntity<Product> getProductById(long id) {
        Optional<Product> product = productRepository.findById(id);
        if(product.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(product.get(),HttpStatus.OK);
    }

    public ResponseEntity<Product> updateProduct(long id, Product product) {
        Optional<Product> existing = productRepository.findById(id);
        if(existing.isEmpty()){
            // Don't send an empty Product object — just send the 404 status with no body
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Product p = existing.get();
        p.setProductName(product.getProductName());
        p.setDescription(product.getDescription());
        p.setBrand(product.getBrand());
        p.setPrice(product.getPrice());
        p.setCategory(product.getCategory());
        p.setStock(product.getStock());
        p.setAvailable(product.isAvailable());
        productRepository.save(p);
        return new ResponseEntity<>(p,HttpStatus.OK);
    }

    public ResponseEntity<String> deleteProduct(long id) {
        Optional<Product> product = productRepository.findById(id);
        if(product.isEmpty()){
            return new ResponseEntity<>("Product Not Found",HttpStatus.NOT_FOUND);
        }
        productRepository.deleteById(id);
        return new ResponseEntity<>("Deletion successful",HttpStatus.OK);
    }
    public ResponseEntity<List<Product>> search(String keyword){
        return new ResponseEntity<>(productRepository.findByProductNameContainingIgnoreCase(keyword),HttpStatus.OK);
    }
    public ResponseEntity<List<Product>>getByCategory(String category){
        return new ResponseEntity<>(productRepository.findByCategoryIgnoreCase(category),HttpStatus.OK);
    }
}
