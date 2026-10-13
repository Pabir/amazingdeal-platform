package com.amazingdeal.commerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CommerceApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CommerceApiApplication.class, args);
    }
}
