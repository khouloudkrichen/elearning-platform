// cSpell:ignore BROUILLON ATTENTE VALIDATION SUPPRIME  formateur etudiant abonnement

import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CoursService, Cours, EtatCours } from '../../services/cours';
import { FormateurService, FormateurResponse } from '../../services/formateur';
import { AdminService, EtudiantResponse } from '../../services/admin';

// ── Interfaces locales ────────────────────────────────
export interface DashboardStats {
  totalCours:       number;
  coursPublies:     number;
  coursEnAttente:   number;
  coursValides:     number;
  totalFormateurs:  number;
  formateursActifs: number;
  formateursEnAttente: number;
  totalEtudiants:   number;
  revenus:          number;
  abonnes:          number;
}

export interface ActiviteItem {
  type:    'cours' | 'formateur' | 'etudiant' | 'abonnement';
  message: string;
  temps:   string;
  icon:    string;
  color:   string;
}

@Component({
  selector:    'app-admin-dashboard',
  standalone:  true,
  templateUrl: './admin-dashboard.html',
  styleUrls:   ['./admin-dashboard.scss'],
  imports:     [CommonModule],
})
export class AdminDashboard implements OnInit, AfterViewInit {

  @ViewChild('chartCoursRef') chartCoursRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartStatutsRef') chartStatutsRef!: ElementRef<HTMLCanvasElement>;

  // ── State ─────────────────────────────────────────────
  loading = true;
  errorMessage = '';

  stats: DashboardStats = {
    totalCours: 0, coursPublies: 0, coursEnAttente: 0, coursValides: 0,
    totalFormateurs: 0, formateursActifs: 0, formateursEnAttente: 0,
    totalEtudiants: 0, revenus: 0, abonnes: 0,
  };

  derniersCours:        Cours[]             = [];
  dernieresCandidat:    FormateurResponse[] = [];
  activites:            ActiviteItem[]      = [];
  allCours:             Cours[]             = [];
  allFormateurs:        FormateurResponse[] = [];

  chartLoaded = false;
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(
    private readonly coursService:     CoursService,
    private readonly formateurService: FormateurService,
    private readonly adminService:     AdminService,
    private readonly router:           Router,
    private readonly cdr:              ChangeDetectorRef
  ) {}

  // ── Lifecycle ─────────────────────────────────────────

  ngOnInit(): void {
    this.chargerDonnees();
  }

  ngAfterViewInit(): void {
    // Les charts sont dessinés après que les données arrivent
  }

  // ── Chargement ────────────────────────────────────────

  chargerDonnees(): void {
    this.loading = true;
    let done = 0;
    const check = () => { if (++done === 3) { this.loading = false; this.construireActivites(); this.cdr.detectChanges(); setTimeout(() => this.dessinerCharts(), 100); } };

    // 1. Cours
    this.coursService.getAllCours().subscribe({
      next: (data: Cours[]) => {
        this.allCours          = data;
        this.stats.totalCours  = data.length;
        this.stats.coursPublies    = data.filter((c: Cours) => c.etatPublication === 'PUBLIE').length;
        this.stats.coursEnAttente  = data.filter((c: Cours) => c.etatPublication === 'EN_ATTENTE_VALIDATION').length;
        this.stats.coursValides    = data.filter((c: Cours) => c.etatPublication === 'EN_ATTENTE_VALIDATION').length;
        this.derniersCours     = [...data].reverse().slice(0, 5);
        check();
      },
      error: (err: unknown) => { console.error(err); check(); }
    });

    // 2. Formateurs
    this.formateurService.getFormateursEnAttente().subscribe({
      next: (data: FormateurResponse[]) => {
        this.allFormateurs              = data;
        this.stats.formateursEnAttente  = data.length;
        this.dernieresCandidat          = data.slice(0, 5);
        check();
      },
      error: (err: unknown) => { console.error(err); check(); }
    });

    // 3. Etudiants
    this.adminService.getEtudiants().subscribe({
      next: (data: EtudiantResponse[]) => {
        this.stats.totalEtudiants = data.length;
        check();
      },
      error: (err: unknown) => { console.error(err); check(); }
    });
  }

  // ── Activité récente ──────────────────────────────────

  construireActivites(): void {
    this.activites = [];

    // Derniers cours soumis
    this.derniersCours.slice(0, 3).forEach((c: Cours) => {
      this.activites.push({
        type:    'cours',
        message: `Nouveau cours soumis : "${c.titre}"`,
        temps:   'Récemment',
        icon:    '📚',
        color:   '#6366f1',
      });
    });

    // Candidatures formateurs
    this.dernieresCandidat.slice(0, 3).forEach((f: FormateurResponse) => {
      this.activites.push({
        type:    'formateur',
        message: `Candidature de ${f.nom} en attente de validation`,
        temps:   'Récemment',
        icon:    '👨‍🏫',
        color:   '#8b5cf6',
      });
    });

    // Limiter à 6 items
    this.activites = this.activites.slice(0, 6);
  }

  // ── Charts (Canvas API pure — pas de dépendance externe) ──

  dessinerCharts(): void {
    this.dessinerBarChart();
    this.dessinerDoughnut();
    this.chartLoaded = true;
    this.cdr.detectChanges();
  }

  dessinerBarChart(): void {
    const canvas = this.chartCoursRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = 200;

    const data   = [this.stats.totalCours, this.stats.coursPublies, this.stats.coursEnAttente, this.stats.coursValides];
    const labels = ['Total', 'Publiés', 'En attente', 'Validés'];
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];
    const max    = Math.max(...data, 1);

    ctx.clearRect(0, 0, W, H);

    const barW   = 44;
    const gap    = (W - barW * data.length) / (data.length + 1);
    const padTop = 20;
    const padBot = 32;
    const chartH = H - padTop - padBot;

    data.forEach((val, i) => {
      const x   = gap + i * (barW + gap);
      const bH  = (val / max) * chartH;
      const y   = padTop + chartH - bH;

      // Barre avec gradient
      const grad = ctx.createLinearGradient(0, y, 0, y + bH);
      grad.addColorStop(0, colors[i]);
      grad.addColorStop(1, colors[i] + '88');
      ctx.fillStyle = grad;

      // Barre arrondie
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + bH);
      ctx.lineTo(x, y + bH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();

      // Valeur au-dessus
      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 13px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(val), x + barW / 2, y - 6);

      // Label en dessous
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.fillText(labels[i], x + barW / 2, H - 8);
    });
  }

  dessinerDoughnut(): void {
    const canvas = this.chartStatutsRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = 200;

    const data   = [this.stats.coursPublies, this.stats.coursEnAttente, this.stats.coursValides,
                    Math.max(0, this.stats.totalCours - this.stats.coursPublies - this.stats.coursEnAttente - this.stats.coursValides)];
    const labels = ['Publiés', 'En attente', 'Validés', 'Retirés'];
    const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    const total  = data.reduce((a, b) => a + b, 0) || 1;

    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const R  = Math.min(cx, cy) - 20;
    const r  = R * 0.58;

    let angle = -Math.PI / 2;

    data.forEach((val, i) => {
      if (val === 0) return;
      const slice = (val / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      angle += slice;
    });

    // Trou central (doughnut)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Texte central
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), cx, cy - 8);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.fillText('formations', cx, cy + 12);
  }

  // ── Helpers ───────────────────────────────────────────

  getStatutLabel(statut: EtatCours): string {
    const labels: Record<string, string> = {
      BROUILLON: 'Brouillon', EN_ATTENTE_VALIDATION: 'En attente', PUBLIE: 'Publié', SUPPRIME: 'Supprimé'
    };
    return labels[statut] ?? statut;
  }

  getStatutClass(statut: EtatCours): string {
    const classes: Record<string, string> = {
      BROUILLON: 'brouillon', EN_ATTENTE_VALIDATION: 'attente', PUBLIE: 'publie', SUPPRIME: 'supprime'
    };
    return classes[statut] ?? '';
  }

  getInitiales(nom: string): string {
    if (!nom?.trim()) return '?';
    return nom.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  allerVersCours():      void { /* émettre un event vers admin parent si besoin */ }
  allerVersFormateurs(): void { }
}