import { Component, OnInit } from '@angular/core';
import { FormateurService, FormateurResponse } from '../../services/formateur';

@Component({
  selector: 'app-admin-formateurs',
  templateUrl: './admin-formateurs.html',
  styleUrl: './admin-formateurs.scss',
  standalone: false,
})
export class AdminFormateurs implements OnInit {
  formateurs: FormateurResponse[] = [];

  constructor(private formateurService: FormateurService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.formateurService.getFormateursEnAttente().subscribe({
      next: (data) => (this.formateurs = data),
    });
  }

  accepter(id: number) {
    this.formateurService.accepterFormateur(id).subscribe(() => this.load());
  }

  refuser(id: number) {
    const commentaireAdmin = prompt('Raison du refus') || '';
    this.formateurService.refuserFormateur(id, { commentaireAdmin }).subscribe(() => this.load());
  }
}
