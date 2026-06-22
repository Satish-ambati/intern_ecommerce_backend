package com.demo.Demo.controller;

import com.demo.Demo.Dto.LoginRequestDetails;
import com.demo.Demo.model.User;
import com.demo.Demo.service.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthenticationController {
    @Autowired
    private AuthenticationService authenticationService;
    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody User user){
        return authenticationService.addUser(user);
    }
    //Response Entity
    @GetMapping("/")
    public String getCsrf(HttpServletRequest request){
        return "Session ID : "+request.getSession().getId();
    }
    @PostMapping("/login")
    public ResponseEntity<String> validate(@RequestBody LoginRequestDetails request){
        return authenticationService.VerifyUser(request.getEmail(),request.getPassword());
    }
}
