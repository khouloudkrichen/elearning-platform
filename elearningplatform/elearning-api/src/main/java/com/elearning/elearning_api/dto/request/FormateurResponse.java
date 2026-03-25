package com.elearning.elearning_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FormateurResponse {
    private Long id;
    private String nom;
    private String email;
    private String status;
    private String portfolio;
    private String specialite;
    private String bio;
    private String cvUrl;
    private String diplomeUrl;
    private String certificatUrl;
    private String attestationUrl;
    private String motivation;
    private String commentaireAdmin;
}