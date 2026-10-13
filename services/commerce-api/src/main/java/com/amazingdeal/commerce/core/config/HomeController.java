package com.amazingdeal.commerce.core.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    /**
     * Redirect root URL to interactive Swagger UI documentation.
     */
    @GetMapping("/")
    public String index() {
        return "redirect:/swagger-ui/index.html";
    }
}
