import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { authInterceptor } from './services/auth-interceptor';

// Tous les composants sont importés ici
// Les non-standalone restent en declarations
// Les standalone vont dans imports
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Student } from './pages/student/student';
import { Teacher } from './pages/teacher/teacher';
import { TeacherApplication } from './pages/teacher-application/teacher-application';
import { AdminFormateurs } from './pages/admin-formateurs/admin-formateurs';
import { Admin } from './pages/admin/admin';
import { TeacherPending } from './pages/teacher-pending/teacher-pending';
import { Categories } from './pages/admin-categories/categories/categories';
import { SousCategories } from './pages/admin-categories/sous-categories/sous-categories';
import { Courses } from './pages/admin-cours/admin-cours';
import { AdminBloques } from './pages/admin-bloques/admin-bloques';

@NgModule({
  declarations: [
    App,
    Login,
    Register,
    Student,
    Teacher,
    TeacherApplication,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,          // ← partagé avec tous les composants en declarations
    // Standalone components
    Admin,
    TeacherPending,
    Categories,
    SousCategories,
    Courses,
    AdminFormateurs,
    AdminBloques,
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]), withFetch())
  ],
  bootstrap: [App],
})
export class AppModule {}