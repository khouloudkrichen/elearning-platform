import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Admin } from './pages/admin/admin';
import { Student } from './pages/student/student';
import { Teacher } from './pages/teacher/teacher';
import { TeacherApplication } from './pages/teacher-application/teacher-application';
import { TeacherPending } from './pages/teacher-pending/teacher-pending';
import { AdminFormateurs } from './pages/admin-formateurs/admin-formateurs';
import { Categories } from './pages/admin-categories/categories/categories';
import { authInterceptor } from './services/auth-interceptor';
import { SousCategories } from './pages/admin-categories/sous-categories/sous-categories';

@NgModule({
  declarations: [
    App,
    Login,
    Register,
    Student,
    Teacher,
    TeacherApplication,
    AdminFormateurs,
    
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, Categories, Admin, TeacherPending,SousCategories],
  providers: [provideHttpClient(withInterceptors([authInterceptor]), withFetch())],
  bootstrap: [App],
})
export class AppModule {}
