package com.elearning.elearning_api.repository;

import com.elearning.elearning_api.entity.Formateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormateurRepository extends JpaRepository<Formateur, Long> {
    List<Formateur> findByStatus(String status);
}