package com.demo.Demo.service;

import com.demo.Demo.model.Cart;
import com.demo.Demo.model.CartItem;
import com.demo.Demo.model.Product;
import com.demo.Demo.model.User;
import com.demo.Demo.repository.CartItemRepository;
import com.demo.Demo.repository.CartRepository;
import com.demo.Demo.repository.ProductRepository;
import com.demo.Demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.Optional;
@Service
public class CartService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CartItemRepository cartItemRepository;

    public ResponseEntity<String> addToCart(
            String email,
            long productId,
            int quantity) {
        Optional<User> u1 = userRepository.findById(email);
        if (u1.isEmpty()) {
            return new ResponseEntity<>("User Not Found",HttpStatus.NOT_FOUND);
        }

        Optional<Product> pd = productRepository.findById(productId);
        if (pd.isEmpty()) {
            return new ResponseEntity<>("Product Not Found",HttpStatus.NOT_FOUND);
        }
        User user = u1.get();
        Product product = pd.get();
        // Stock Validation
        if (quantity > product.getStock()) {
            return new ResponseEntity<>("Insufficient Stock Available",HttpStatus.BAD_REQUEST);
        }
        Cart cart = user.getCart();
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
            user.setCart(cart);
            userRepository.save(user);
        }
        // Check if product already exists in cart
        Optional<CartItem> existingItem =
                cart.getCartItems()
                        .stream()
                        .filter(item ->
                                item.getProduct()
                                        .getProductId()
                                        == productId)
                        .findFirst();
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;
            // Check stock again
            if (newQuantity > product.getStock()) {
                return new ResponseEntity<>("Requested quantity exceeds stock",HttpStatus.BAD_REQUEST);
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
            return new ResponseEntity<>("Cart Quantity Updated",HttpStatus.OK);
        }
        // New Cart Item
        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        return new ResponseEntity<>("Added To Cart Successfully",HttpStatus.OK);
    }

    public ResponseEntity<String> removeFromCart(long cartId) {
        Optional<CartItem> item = cartItemRepository.findById(cartId);
        if(item.isEmpty()){
            return new ResponseEntity<>("cart item not found",HttpStatus.NOT_FOUND);
        }
        cartItemRepository.deleteById(cartId);
        return new ResponseEntity<>("Removes successfully",HttpStatus.OK);
    }

    public ResponseEntity<Cart> getCart(
            String email){
        Optional<User> user =
                userRepository.findById(email);
        if(user.isEmpty()){
            return new ResponseEntity<>(
                    HttpStatus.NOT_FOUND);
        }
        Cart cart = user.get().getCart();
        // If user exists but has never added anything, cart will be null
        // Return 204 No Content instead of sending null in the response body
        if (cart == null) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }
    public ResponseEntity<String> updateQuantity(
            long cartItemId,
            int quantity){

        Optional<CartItem> item =
                cartItemRepository.findById(cartItemId);

        if(item.isEmpty()){

            return new ResponseEntity<>(
                    "Cart Item Not Found",
                    HttpStatus.NOT_FOUND);
        }

        item.get().setQuantity(quantity);

        cartItemRepository.save(item.get());

        return new ResponseEntity<>(
                "Quantity Updated",
                HttpStatus.OK);
    }
}
