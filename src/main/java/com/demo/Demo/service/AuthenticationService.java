package com.demo.Demo.service;

import com.demo.Demo.model.User;
import com.demo.Demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthenticationService {
    @Autowired
    private JwtService jwtService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    public ResponseEntity<String> addUser(User user) {
        try{
            Optional<User> u1 = userRepository.findById(user.getEmail());
            if(u1.isPresent()){
                // 302 FOUND is a redirect — wrong status for "already exists"
                // 409 CONFLICT is the correct HTTP status here
                return new ResponseEntity<>("Email already exists", HttpStatus.CONFLICT);
            }
            user.setPassword(encoder.encode(user.getPassword()));
            userRepository.save(user);
            return  new ResponseEntity<>("user added successfully",HttpStatus.OK);
        }catch(Exception e){
            return new ResponseEntity<>("Something went wrong",HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    public ResponseEntity<String> VerifyUser(String email, String password) {
        try {
            // authenticate() throws BadCredentialsException if email/password is wrong
            // so we MUST wrap it in try-catch — the if-block below never runs on failure
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
            if (authentication.isAuthenticated()) {
                return new ResponseEntity<>(jwtService.geneteToken(email), HttpStatus.OK);
            }
            return new ResponseEntity<>("Authentication failed", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            // Wrong password or user not found lands here
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
    }
}
