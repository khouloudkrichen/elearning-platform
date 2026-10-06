package com.elearning.elearning_api.service;

import com.elearning.elearning_api.dto.request.RefusFormateurRequest;
import com.elearning.elearning_api.dto.response.FormateurResponse;
import com.elearning.elearning_api.entity.Formateur;
import com.elearning.elearning_api.repository.FormateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FormateurService {

    private final FormateurRepository formateurRepository;

    private final String uploadDir = "uploads/";

    public FormateurResponse completerCandidature(
        Long id,
        String specialite,
        String bio,
        String portfolio,
        String motivation,
        MultipartFile cv,
        MultipartFile diplome,
        MultipartFile certificat,
        MultipartFile attestation
) {
    Formateur formateur = formateurRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Formateur introuvable"));

    formateur.setSpecialite(specialite);
    formateur.setBio(bio);
    formateur.setPortfolio(portfolio);
    formateur.setMotivation(motivation);

    formateur.setStatus("EN_ATTENTE");

    try {
        if (cv != null && !cv.isEmpty()) {
            formateur.setCvUrl(saveFile(cv));
        }

        if (diplome != null && !diplome.isEmpty()) {
            formateur.setDiplomeUrl(saveFile(diplome));
        }

        if (certificat != null && !certificat.isEmpty()) {
            formateur.setCertificatUrl(saveFile(certificat));
        }

        if (attestation != null && !attestation.isEmpty()) {
            formateur.setAttestationUrl(saveFile(attestation));
        }
    } catch (IOException e) {
        throw new RuntimeException("Erreur lors de l'enregistrement des fichiers.");
    }

    formateurRepository.save(formateur);

    return mapToResponse(formateur);
}

    public List<FormateurResponse> getFormateursEnAttente() {
        return formateurRepository.findByStatus("EN_ATTENTE")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public FormateurResponse getFormateurById(Long id) {
        Formateur formateur = formateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formateur introuvable"));

        return mapToResponse(formateur);
    }

    public FormateurResponse accepterFormateur(Long id) {
        Formateur formateur = formateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formateur introuvable"));

        formateur.setStatus("ACTIVE");
        formateur.setCommentaireAdmin("Candidature acceptée");

        formateurRepository.save(formateur);

        return mapToResponse(formateur);
    }

    public FormateurResponse refuserFormateur(Long id, RefusFormateurRequest request) {
        Formateur formateur = formateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formateur introuvable"));

        formateur.setStatus("REFUSE");
        formateur.setCommentaireAdmin(request.getCommentaireAdmin());

        formateurRepository.save(formateur);

        return mapToResponse(formateur);
    }

    private String saveFile(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || !originalFileName.toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("Seuls les fichiers PDF sont autorisés.");
        }

        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID() + "_" + originalFileName;
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + fileName;
    }

    private FormateurResponse mapToResponse(Formateur formateur) {
        return new FormateurResponse(
                formateur.getId(),
                formateur.getNom(),
                formateur.getEmail(),
                formateur.getStatus(),
                formateur.getPortfolio(),
                formateur.getSpecialite(),
                formateur.getBio(),
                formateur.getCvUrl(),
                formateur.getDiplomeUrl(),
                formateur.getCertificatUrl(),
                formateur.getAttestationUrl(),
                formateur.getMotivation(),
                formateur.getCommentaireAdmin()
        );
    }
}