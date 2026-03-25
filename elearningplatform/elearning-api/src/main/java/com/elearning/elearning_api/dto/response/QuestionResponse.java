package com.elearning.elearning_api.dto.response;

import lombok.Data;

@Data
public class QuestionResponse {
    private Long id;
    private String enonce;
    private Integer point;
    private String evaluationTitre;
}