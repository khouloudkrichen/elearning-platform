// cSpell:ignore formateur candidature

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormateurService, FormateurResponse } from '../../services/formateur';

@Component({
  selector: 'app-admin-formateurs',
  standalone: true,
  templateUrl: './admin-formateurs.html',
  styleUrls: ['./admin-formateurs.scss'],
  imports: [CommonModule],
})
export class AdminFormateurs implements OnInit {

  formateurs:   FormateurResponse[] = [];
  loading       = false;
  errorMessage  = '';

  constructor(
    private readonly formateurService: FormateurService,
    private readonly cdr:              ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerFormateurs();
  }

  chargerFormateurs(): void {
    this.loading      = true;
    this.errorMessage = '';
    this.formateurService.getFormateursEnAttente().subscribe({
      next: (data: FormateurResponse[]) => {
        this.formateurs = Array.isArray(data) ? data : [];
        this.loading    = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur chargement candidatures:', err);
        this.errorMessage = 'Erreur lors du chargement des candidatures';
        this.loading      = false;
        this.cdr.detectChanges();
      }
    });
  }

  accepter(id: number): void {
    this.formateurService.accepterFormateur(id).subscribe({
      next: () => { this.chargerFormateurs(); },
      error: (err: unknown) => {
        console.error("Erreur acceptation:", err);
        this.errorMessage = "Erreur lors de l'acceptation";
        this.cdr.detectChanges();
      }
    });
  }

  refuser(id: number): void {
    const commentaireAdmin = prompt('Raison du refus :') || 'Refus';
    this.formateurService.refuserFormateur(id, { commentaireAdmin }).subscribe({
      next: () => { this.chargerFormateurs(); },
      error: (err: unknown) => {
        console.error("Erreur refus:", err);
        this.errorMessage = "Erreur lors du refus";
        this.cdr.detectChanges();
      }
    });
  }

  getFileUrl(path: string | null | undefined): string {
    if (!path) return '#';
    return `http://localhost:8081${path}`;
  }

  getInitiales(nom: string): string {
    if (!nom?.trim()) return '?';
    return nom.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }
  get withDocsCount(): number {
  return this.formateurs.filter(f =>
    f.cvUrl || f.diplomeUrl || f.certificatUrl || f.attestationUrl
  ).length;
}
}