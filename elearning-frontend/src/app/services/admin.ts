import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EtudiantResponse {
  id: number;
  nom: string;
  email: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  getEtudiants(): Observable<EtudiantResponse[]> {
    return this.http.get<EtudiantResponse[]>(`${this.apiUrl}/etudiants`, {
      headers: this.getAuthHeaders(),
    });
  }
}
