import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormateurService, FormateurResponse } from '../../services/formateur';
import { AdminService, EtudiantResponse } from '../../services/admin';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  standalone: false,
})
export class Admin implements OnInit {
  section: 'candidatures' | 'etudiants' | 'blocked' = 'candidatures';

  formateurs: FormateurResponse[] = [];
  etudiants: EtudiantResponse[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private formateurService: FormateurService,
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.setSection('candidatures');
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  setSection(sec: 'candidatures' | 'etudiants' | 'blocked'): void {
    this.section = sec;
    this.errorMessage = '';

    if (sec === 'candidatures') {
      this.loadFormateurs();
    } else if (sec === 'etudiants') {
      this.loadEtudiants();
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  loadFormateurs(): void {
    this.loading = true;
    this.errorMessage = '';
    this.formateurs = [];

    this.formateurService.getFormateursEnAttente().subscribe({
      next: (data) => {
        console.log('Formateurs en attente :', data);
        this.formateurs = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement admin :', error);
        this.errorMessage = 'Erreur lors du chargement des candidatures.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadEtudiants(): void {
    this.loading = true;
    this.errorMessage = '';
    this.etudiants = [];

    this.adminService.getEtudiants().subscribe({
      next: (data) => {
        console.log('Étudiants :', data);
        this.etudiants = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement étudiants :', error);
        this.errorMessage = 'Erreur lors du chargement des étudiants.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  accepter(id: number): void {
    this.formateurService.accepterFormateur(id).subscribe({
      next: () => this.loadFormateurs(),
      error: (error) => console.error('Erreur acceptation :', error),
    });
  }

  refuser(id: number): void {
    const commentaireAdmin = prompt('Raison du refus :') || 'Profil refusé';

    this.formateurService.refuserFormateur(id, { commentaireAdmin }).subscribe({
      next: () => this.loadFormateurs(),
      error: (error) => console.error('Erreur refus :', error),
    });
  }

  getFileUrl(path: string | null | undefined): string {
    if (!path) return '#';
    return `http://localhost:8081${path}`;
  }
}
