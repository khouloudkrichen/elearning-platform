import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormateurService, FormateurResponse } from '../../services/formateur';
import { AdminService, EtudiantResponse } from '../../services/admin';
import { Categories } from '../admin-categories/categories/categories';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  standalone: true,
   imports: [
    CommonModule, 
    FormsModule,
    Categories
  ],
})
export class Admin implements OnInit {

  section: 'candidatures' | 'etudiants' | 'blocked' | 'categories' = 'candidatures';

  formateurs: FormateurResponse[] = [];
  etudiants: EtudiantResponse[] = [];
  showDeleteConfirm = false;

  loading = false;
  errorMessage = '';

  constructor(
    private formateurService: FormateurService,
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setSection('candidatures');
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  setSection(sec: 'candidatures' | 'etudiants' | 'blocked' | 'categories'): void {
    this.section = sec;
    this.errorMessage = '';
    this.loading = true;

    if (sec === 'candidatures') {
      this.loadFormateurs();
    } else if (sec === 'etudiants') {
      this.loadEtudiants();
    } else {
      this.loading = false;
    }
  }

  // FORMATEURS
  loadFormateurs(): void {
    this.formateurs = [];

    this.formateurService.getFormateursEnAttente().subscribe({
      next: (data) => {
        this.formateurs = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erreur chargement candidatures';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ETUDIANTS
  loadEtudiants(): void {
    this.etudiants = [];

    this.adminService.getEtudiants().subscribe({
      next: (data) => {
        this.etudiants = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erreur chargement étudiants';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
  
  // ACTIONS FORMATEURS
  accepter(id: number): void {
    this.formateurService.accepterFormateur(id).subscribe({
      next: () => {
        this.loadFormateurs();
      },
      error: (err) => {
        console.error('Erreur lors de l\'acceptation:', err);
        this.errorMessage = 'Erreur lors de l\'acceptation';
      }
    });
  }

  refuser(id: number): void {
    const commentaireAdmin = prompt('Raison du refus :') || 'Refus';

    this.formateurService.refuserFormateur(id, { commentaireAdmin }).subscribe({
      next: () => {
        this.loadFormateurs();
      },
      error: (err) => {
        console.error('Erreur lors du refus:', err);
        this.errorMessage = 'Erreur lors du refus';
      }
    });
  }

  getFileUrl(path: string | null | undefined): string {
    if (!path) return '#';
    return `http://localhost:8081${path}`;
  }
}