package com.elearning.elearning_api.service;

import com.elearning.elearning_api.dto.request.InscriptionRequest;
import com.elearning.elearning_api.dto.response.InscriptionResponse;
import com.elearning.elearning_api.entity.Cours;
import com.elearning.elearning_api.entity.Etudiant;
import com.elearning.elearning_api.entity.Inscription;
import com.elearning.elearning_api.enums.StatutInscription;
import com.elearning.elearning_api.exception.AlreadyExistsException;
import com.elearning.elearning_api.exception.ResourceNotFoundException;
import com.elearning.elearning_api.repository.CoursRepository;
import com.elearning.elearning_api.repository.EtudiantRepository;
import com.elearning.elearning_api.repository.InscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InscriptionService {

    private final InscriptionRepository inscriptionRepository;
    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;

    public InscriptionResponse inscrire(InscriptionRequest request) {
        if (inscriptionRepository.existsByEtudiantIdAndCoursId(
                request.getEtudiantId(), request.getCoursId()))
            throw new AlreadyExistsException("Etudiant already inscribed in this cours");

        Etudiant etudiant = etudiantRepository.findById(request.getEtudiantId())
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant not found: " + request.getEtudiantId()));

        Cours cours = coursRepository.findById(request.getCoursId())
                .orElseThrow(() -> new ResourceNotFoundException("Cours not found: " + request.getCoursId()));

        Inscription inscription = new Inscription();
        inscription.setEtudiant(etudiant);
        inscription.setCours(cours);
        inscription.setStatut(StatutInscription.EN_ATTENTE);

        return toResponse(inscriptionRepository.save(inscription));
    }

    public InscriptionResponse updateStatut(Long id, StatutInscription statut) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription not found: " + id));
        inscription.setStatut(statut);
        return toResponse(inscriptionRepository.save(inscription));
    }

    public List<InscriptionResponse> getByEtudiant(Long etudiantId) {
        return inscriptionRepository.findByEtudiantId(etudiantId)
                .stream().map(this::toResponse).toList();
    }

    public List<InscriptionResponse> getByCours(Long coursId) {
        return inscriptionRepository.findByCoursId(coursId)
                .stream().map(this::toResponse).toList();
    }

    public void annuler(Long id) {
        updateStatut(id, StatutInscription.ANNULE); 
    }

    private InscriptionResponse toResponse(Inscription inscription) {
        InscriptionResponse response = new InscriptionResponse();
        response.setId(inscription.getId());
        response.setDateInscription(inscription.getDateInscription());
        response.setStatut(inscription.getStatut());
        response.setEtudiantId(inscription.getEtudiant().getId()); 
        response.setEtudiantNom(inscription.getEtudiant().getNom());
        response.setCoursId(inscription.getCours().getId());
        response.setCoursTitre(inscription.getCours().getTitre());
        return response;
    }
}