package com.elearning.elearning_api.service;

import com.elearning.elearning_api.dto.response.EtudiantResponse;
import com.elearning.elearning_api.repository.EtudiantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final EtudiantRepository etudiantRepository;

    public List<EtudiantResponse> getAllEtudiants() {
        return etudiantRepository.findAll()
                .stream()
                .map(e -> new EtudiantResponse(
                        e.getId(),
                        e.getNom(),
                        e.getEmail(),
                        e.getStatus()
                ))
                .toList();
    }
}