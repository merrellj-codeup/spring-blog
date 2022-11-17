package com.codeup.springblog.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HelloController {
    @GetMapping("/hello")
    @ResponseBody
    public String helloWorld(){
        return "<h1>Hello World</h1>";
    }

    @GetMapping("/hello/{name}")
    public String sayHello (@PathVariable String name) {
        return "hello";
    }
}
