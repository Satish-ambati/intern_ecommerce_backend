package com.demo.Demo.model;

import com.demo.Demo.enums.Role;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@lombok.Data
@Entity
public class User {
    private String name;
    @Id
    private String email;
    private String password;
    @CreationTimestamp
    @Column(updatable = false)
    private Date created_at;
    @Enumerated(EnumType.STRING)
    public Role role;

    @OneToOne(mappedBy = "user",cascade = CascadeType.ALL)
    private Cart cart;
}