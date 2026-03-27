// categories.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Categorie } from '../../../services/category';
import { SousCategories } from '../sous-categories/sous-categories';

@Component({
  selector: 'app-categories',
  standalone: true,
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
  imports: [CommonModule, FormsModule, SousCategories],
})
export class Categories implements OnInit {
  categories: Categorie[] = [];
  loading = false;
  errorMessage = '';

  // FORMULAIRE CATÉGORIE
  nomCategorie = '';
  descriptionCategorie = '';
  showForm = false;

  // DELETE CATÉGORIE
  showDeleteConfirm = false;
  categoryToDelete: Categorie | null = null;

  // SOUS-CATÉGORIES MODAL
  showSousCategoriesModal = false;
  selectedCategory: Categorie | null = null;

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
  this.loading = true;

  this.categoryService.getAll().subscribe({
    next: (data: Categorie[]) => {
      console.log("DATA API 👉", data); // 🔥 AJOUTE ÇA
      this.categories = data;
      this.loading = false;
    },
    error: (err: any) => {
      console.error("ERREUR API ❌", err); // 🔥 AJOUTE ÇA
      this.errorMessage = 'Erreur chargement catégories';
      this.loading = false;
    }
  });
}

  openForm(): void {
    this.showForm = true;
    this.nomCategorie = '';
    this.descriptionCategorie = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.nomCategorie = '';
    this.descriptionCategorie = '';
  }

getSousCategoriesCount(category: Categorie): number {
  return category.sousCategories?.length || 0;
}
  addCategory(): void {
    if (!this.nomCategorie.trim()) {
      this.errorMessage = 'Le nom est requis';
      return;
    }
    
    const newCat: Categorie = {
      nom: this.nomCategorie.trim(),
      description: this.descriptionCategorie.trim() || ''
    };

    this.loading = true;
    this.errorMessage = '';
    
    this.categoryService.create(newCat).subscribe({
      next: (createdCat: Categorie) => {
        this.categories.push(createdCat);
        this.closeForm();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur ajout:', err);
        this.errorMessage = 'Erreur lors de l\'ajout';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(category: Categorie): void {
    this.categoryToDelete = category;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.categoryToDelete = null;
  }

  deleteCategory(): void {
    if (!this.categoryToDelete?.id) return;
    
    this.loading = true;
    this.categoryService.delete(this.categoryToDelete.id).subscribe({
      next: () => {
        this.categories = this.categories.filter((c: Categorie) => c.id !== this.categoryToDelete?.id);
        this.closeDeleteConfirm();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur suppression:', err);
        this.errorMessage = 'Erreur lors de la suppression';
        this.loading = false;
        this.closeDeleteConfirm();
        this.cdr.detectChanges();
      }
    });
  }

  openSousCategories(category: Categorie): void {
    this.selectedCategory = category;
    this.showSousCategoriesModal = true;
  }

  closeSousCategoriesModal(): void {
    this.showSousCategoriesModal = false;
    this.selectedCategory = null;
  }

  onSousCategoriesUpdated(): void {
    // Recharger les catégories pour mettre à jour le compteur
    this.loadCategories();
  }
  // Ajoutez cette méthode dans votre classe Categories
getCategoryIcon(nom: string): string {
  const icons: { [key: string]: string } = {
    'Développement': '💻',
    'Développement Web': '💻',
    'Web': '🌐',
    'Design': '🎨',
    'Marketing': '📈',
    'Business': '💼',
    'Langues': '🗣️',
    'Musique': '🎵',
    'Photo': '📸',
    'Vidéo': '🎬',
    'Science': '🔬',
    'Mathématiques': '📐',
    'Santé': '🏥',
    'Sport': '⚽'
  };
  
  // Chercher une icône correspondante
  for (const [key, icon] of Object.entries(icons)) {
    if (nom.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  // Icône par défaut
  return '📚';
}
}