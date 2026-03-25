package com.elearning.elearning_api.repository;


import com.elearning.elearning_api.entity.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
}