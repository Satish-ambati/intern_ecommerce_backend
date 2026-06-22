    package com.demo.Demo.model;

    import com.fasterxml.jackson.annotation.JsonFormat;
    import jakarta.persistence.*;
    import lombok.Data;
    import org.hibernate.annotations.CreationTimestamp;

    import java.util.Date;

    @Entity
    @Data
    public class Product {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "product_id")
        private long productId;
        @Column(name = "product_name")
        private String productName;
        private String description;
        private String brand;
        private long price;
        private String category;
        private int stock;
        private boolean isAvailable;
        @CreationTimestamp
        private Date releaseDate;

    }
