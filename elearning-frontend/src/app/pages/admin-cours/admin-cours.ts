// cSpell:ignore formateur categorie statut publie retire valider publier retirer

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursService, Cours, EtatCours } from '../../services/cours';
import { CategoryService, Categorie } from '../../services/category';

@Component({
  selector: 'app-admin-cours',
  standalone: true,
  templateUrl: './admin-cours.html',
  styleUrls: ['./admin-cours.scss'],
  imports: [CommonModule, FormsModule],
})
export class Courses implements OnInit {

  // ── State ─────────────────────────────────────────────
  listeCours:  Cours[]     = [];
  categories:  Categorie[] = [];
  loading      = false;
  errorMessage = '';

  // Filtres
  searchQuery     = '';
  filterStatut    = '';
  filterCategorie = '';
  viewMode: 'grid' | 'list' = 'grid';

  // ── Modal Confirmation ────────────────────────────────
  showConfirm    = false;
  itemToAction:  Cours | null = null;
  pendingAction: 'valider' | 'publier' | 'retirer' | 'supprimer' | '' = '';

  // ── Constructor ───────────────────────────────────────
  constructor(
    private readonly coursService:    CoursService,
    private readonly categoryService: CategoryService,
    private readonly router:          Router,
    private readonly cdr:             ChangeDetectorRef
  ) {}

  // ── Lifecycle ─────────────────────────────────────────

  ngOnInit(): void {
    this.chargerCours();
    this.chargerCategories();
  }

  // ── Chargement ────────────────────────────────────────

  chargerCours(): void {
    this.loading      = true;
    this.errorMessage = '';
    this.coursService.getAllCours().subscribe({
      next: (data: Cours[]) => {
        this.listeCours = data;
        this.loading    = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur chargement liste:', err);
        this.errorMessage = 'Erreur lors du chargement des formations';
        this.loading      = false;
        this.cdr.detectChanges();
      }
    });
  }

  chargerCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data: Categorie[]) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erreur catégories:', err)
    });
  }

  // ── Filtrage ──────────────────────────────────────────

  filteredCours(): Cours[] {
    return this.listeCours.filter((item: Cours) => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchSearch = !q
        || item.titre.toLowerCase().includes(q)
        || (item.formateurNom     ?? '').toLowerCase().includes(q)
        || (item.categorieNom     ?? '').toLowerCase().includes(q)
        || (item.sousCategorieNom ?? '').toLowerCase().includes(q);
      const matchStatut = !this.filterStatut
        || item.statut === (this.filterStatut as EtatCours);
      const matchCat = !this.filterCategorie
        || String(item.categorieId) === this.filterCategorie;
      return matchSearch && matchStatut && matchCat;
    });
  }

  resetFilters(): void {
    this.searchQuery     = '';
    this.filterStatut    = '';
    this.filterCategorie = '';
  }

  // ── Stats ─────────────────────────────────────────────

  getCountByStatut(etat: EtatCours): number {
    return this.listeCours.filter((item: Cours) => item.statut === etat).length;
  }

  // ── Confirmation & actions ────────────────────────────

  confirmAction(item: Cours, action: typeof this.pendingAction): void {
    this.itemToAction  = item;
    this.pendingAction = action;
    this.showConfirm   = true;
    this.errorMessage  = '';
  }

  closeConfirm(): void {
    this.showConfirm   = false;
    this.itemToAction  = null;
    this.pendingAction = '';
  }

  executeAction(): void {
    if (!this.itemToAction?.id || !this.pendingAction) return;

    this.loading  = true;
    const id      = this.itemToAction.id;
    const action  = this.pendingAction;

    let obs$: Observable<Cours | void>;

    switch (action) {
      case 'valider':   obs$ = this.coursService.validerCours(id);   break;
      case 'publier':   obs$ = this.coursService.publierCours(id);   break;
      case 'retirer':   obs$ = this.coursService.retirerCours(id);   break;
      case 'supprimer': obs$ = this.coursService.supprimerCours(id); break;
      default: return;
    }

    obs$.subscribe({
      next: (_result: Cours | void) => {
        if (action === 'supprimer') {
          this.listeCours = this.listeCours.filter((c: Cours) => c.id !== id);
        } else {
          const statutMap: Record<string, EtatCours> = {
            valider: 'VALIDE',
            publier: 'PUBLIE',
            retirer: 'RETIRE',
          };
          const found = this.listeCours.find((c: Cours) => c.id === id);
          if (found) found.statut = statutMap[action];
        }
        this.loading = false;
        this.closeConfirm();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error(`Erreur action "${action}":`, err);
        this.errorMessage = "Erreur lors de l'opération. Veuillez réessayer.";
        this.loading      = false;
        this.closeConfirm();
        this.cdr.detectChanges();
      }
    });
  }

  voirDetail(item: Cours): void {
    this.router.navigate(['/admin/formations', item.id]);
  }

  // ── Helpers affichage ─────────────────────────────────

  getStatutLabel(statut: EtatCours): string {
    const labels: Record<EtatCours, string> = {
      EN_ATTENTE: '⏳ En attente',
      VALIDE:     '✅ Validé',
      PUBLIE:     '● Publié',
      RETIRE:     '🚫 Retiré',
    };
    return labels[statut] ?? statut;
  }

  getStatutCssClass(statut: EtatCours): string {
    const classes: Record<EtatCours, string> = {
      EN_ATTENTE: 'attente',
      VALIDE:     'valide',
      PUBLIE:     'publie',
      RETIRE:     'retire',
    };
    return classes[statut] ?? '';
  }

  getInitiales(nom: string): string {
    if (!nom?.trim()) return '?';
    return nom.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getIcon(categorieNom: string): string {
    const nom = (categorieNom ?? '').toLowerCase();
    if (nom.includes('informatique') || nom.includes('programmation')) return '💻';
    if (nom.includes('langue') || nom.includes('anglais') || nom.includes('français')) return '🌐';
    if (nom.includes('science') || nom.includes('math')) return '🔬';
    if (nom.includes('design')) return '🎨';
    if (nom.includes('base') || nom.includes('données')) return '🗄️';
    if (nom.includes('ia') || nom.includes('intelligence')) return '🤖';
    return '📚';
  }

  getBannerGradient(categorieId: number): string {
    const gradients: string[] = [
      'linear-gradient(135deg,#6366f1,#8b5cf6)',
      'linear-gradient(135deg,#f59e0b,#f97316)',
      'linear-gradient(135deg,#06b6d4,#0ea5e9)',
      'linear-gradient(135deg,#10b981,#06b6d4)',
      'linear-gradient(135deg,#ec4899,#8b5cf6)',
    ];
    return gradients[(categorieId ?? 0) % gradients.length];
  }

  // ── Helpers modal confirmation ────────────────────────

  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      valider: '✅', publier: '🚀', retirer: '⏸️', supprimer: '🗑️'
    };
    return icons[action] ?? '❓';
  }

  getActionTitle(action: string): string {
    const titles: Record<string, string> = {
      valider:   'Valider cette formation ?',
      publier:   'Publier cette formation ?',
      retirer:   'Retirer cette formation ?',
      supprimer: 'Supprimer cette formation ?',
    };
    return titles[action] ?? '';
  }

  getActionVerb(action: string): string {
    const verbs: Record<string, string> = {
      valider:   'valider',
      publier:   'publier',
      retirer:   'retirer',
      supprimer: 'supprimer définitivement',
    };
    return verbs[action] ?? action;
  }

  getActionWarning(action: string): string {
    const warnings: Record<string, string> = {
      valider:   'Le formateur sera notifié de la validation.',
      publier:   'La formation sera immédiatement visible par tous les étudiants.',
      retirer:   "Les étudiants inscrits perdront l'accès.",
      supprimer: 'Toutes les données associées seront perdues.',
    };
    return warnings[action] ?? '';
  }

  getActionNote(action: string): string {
    const notes: Record<string, string> = {
      valider:   '✦ La formation passera en statut "VALIDE"',
      publier:   '🚀 Accessible immédiatement aux étudiants',
      retirer:   '⚠️ La formation sera masquée de la plateforme',
      supprimer: '⚠️ Action irréversible',
    };
    return notes[action] ?? '';
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      valider:   '✅ Valider',
      publier:   '🚀 Publier',
      retirer:   '⏸ Retirer',
      supprimer: '🗑 Supprimer',
    };
    return labels[action] ?? action;
  }
}