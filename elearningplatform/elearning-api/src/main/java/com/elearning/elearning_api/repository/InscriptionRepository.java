package com.elearning.elearning_api.repository;


import com.elearning.elearning_api.entity.Inscription;
import com.elearning.elearning_api.enums.StatutInscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InscriptionRepository extends JpaRepository<Inscription, Long> {
    List<Inscription> findByEtudiantId(Long etudiantId);
    List<Inscription> findByCoursId(Long coursId);
    List<Inscription> findByStatut(StatutInscription statut);
    Optional<Inscription> findByEtudiantIdAndCoursId(Long etudiantId, Long coursId);
    boolean existsByEtudiantIdAndCoursId(Long etudiantId, Long coursId);
}