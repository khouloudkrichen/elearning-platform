import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Enum EtatCours (miroir du backend) ───────────────
export type EtatCours = 'EN_ATTENTE' | 'VALIDE' | 'PUBLIE' | 'RETIRE';

// ── Interfaces ────────────────────────────────────────
export interface Cours {
  id: number;
  titre: string;
  description: string;
  statut: EtatCours;           // correspond à EtatCours côté Java
  categorieId: number;
  categorieNom: string;
  sousCategorieId: number;
  sousCategorieNom: string;
  formateurId: number;
  formateurNom: string;
  formateurEmail?: string;
  dateCreation?: string;
  dateMiseAJour?: string;
  nombreInscrits?: number;
  duree?: string;
  niveau?: 'debutant' | 'intermediaire' | 'avance';
  imageUrl?: string;
  videoUrl?: string;
}

export interface CoursRequest {
  titre: string;
  description: string;
  categorieId: number;
  sousCategorieId: number;
  duree?: string;
  niveau?: string;
  imageUrl?: string;
  videoUrl?: string;
}

// ── Service ───────────────────────────────────────────
@Injectable({
  providedIn: 'root'
})
export class CoursService {

  private readonly baseUrl = 'http://localhost:8080/api/cours';

  constructor(private http: HttpClient) {}

  // ── GET ───────────────────────────────────────────────

  /** GET /api/cours — tous les cours (admin) */
  getAllCours(): Observable<Cours[]> {
    return this.http.get<Cours[]>(this.baseUrl);
  }

  /** GET /api/cours/:id */
  getCoursById(id: number): Observable<Cours> {
    return this.http.get<Cours>(`${this.baseUrl}/${id}`);
  }

  /** GET /api/cours/formateur/:formateurId */
  getCoursByFormateur(formateurId: number): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.baseUrl}/formateur/${formateurId}`);
  }

  /** GET /api/cours/etat/:etat */
  getCoursByEtat(etat: EtatCours): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.baseUrl}/etat/${etat}`);
  }

  // Raccourcis lisibles
  getCoursEnAttente(): Observable<Cours[]> {
    return this.getCoursByEtat('EN_ATTENTE');
  }
  getCoursPublies(): Observable<Cours[]> {
    return this.getCoursByEtat('PUBLIE');
  }
  getCoursRetires(): Observable<Cours[]> {
    return this.getCoursByEtat('RETIRE');
  }

  // ── POST / PUT (Formateur) ────────────────────────────

  /** POST /api/cours */
  createCours(request: CoursRequest): Observable<Cours> {
    return this.http.post<Cours>(this.baseUrl, request);
  }

  /** PUT /api/cours/:id */
  updateCours(id: number, request: CoursRequest): Observable<Cours> {
    return this.http.put<Cours>(`${this.baseUrl}/${id}`, request);
  }

  // ── DELETE (Formateur ou Admin) ───────────────────────

  /** DELETE /api/cours/:id */
  supprimerCours(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ── PATCH etat (Formateur ou Admin) ──────────────────
  // Toutes les actions passent par PATCH /{id}/etat?etat=XXX

  /** PATCH /api/cours/:id/etat?etat=VALIDE */
  validerCours(id: number): Observable<Cours> {
    return this.updateEtat(id, 'VALIDE');
  }

  /** PATCH /api/cours/:id/etat?etat=PUBLIE */
  publierCours(id: number): Observable<Cours> {
    return this.updateEtat(id, 'PUBLIE');
  }

  /** PATCH /api/cours/:id/etat?etat=RETIRE */
  retirerCours(id: number): Observable<Cours> {
    return this.updateEtat(id, 'RETIRE');
  }

  /** PATCH /api/cours/:id/etat?etat=EN_ATTENTE */
  remettreEnAttente(id: number): Observable<Cours> {
    return this.updateEtat(id, 'EN_ATTENTE');
  }

  /** Méthode générique — miroir exact de updateEtat() côté Java */
  updateEtat(id: number, etat: EtatCours): Observable<Cours> {
    const params = new HttpParams().set('etat', etat);
    return this.http.patch<Cours>(`${this.baseUrl}/${id}/etat`, {}, { params });
  }
}