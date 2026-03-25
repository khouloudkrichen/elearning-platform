package com.elearning.elearning_api.dto.response;

import com.elearning.elearning_api.enums.EtatCours;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CoursResponse {
    private Long id;
    private String titre;
    private String description;
    private EtatCours etatPublication;
    private LocalDateTime dateCreation;
    private LocalDateTime datePublication;
    private String formateurNom;
    private Long formateurId;
    private String sousCategorieNom;
    private Long sousCategorieId;
}