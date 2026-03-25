package com.elearning.elearning_api.controller;

import com.elearning.elearning_api.dto.response.EtudiantResponse;
import com.elearning.elearning_api.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/etudiants")
    public List<EtudiantResponse> getAllEtudiants() {
        return adminService.getAllEtudiants();
    }
}