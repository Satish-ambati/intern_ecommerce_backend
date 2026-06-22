package com.demo.Demo.controller;

import com.demo.Demo.model.Cart;
import com.demo.Demo.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {
    @Autowired
    private CartService cartService;
    @PostMapping("/add")
    public ResponseEntity<String> addToCart(
            @RequestParam String email,
            @RequestParam long productId,
            @RequestParam int quantity
    ){
    return cartService.addToCart(email,productId,quantity);
    }
    @DeleteMapping("/remove")
    public ResponseEntity<String> removeFromCart(@RequestParam long cartId){
        return cartService.removeFromCart(cartId);
    }
    @GetMapping("/{email}")
    public ResponseEntity<Cart> getCart(
            @PathVariable String email){

        return cartService.getCart(email);
    }
    @PutMapping("/update")
    public ResponseEntity<String> updateQuantity(
            @RequestParam long cartItemId,
            @RequestParam int quantity){
        return cartService.updateQuantity(
                cartItemId,
                quantity);
    }
}
