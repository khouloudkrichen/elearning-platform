import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Admin } from './pages/admin/admin';
import { Student } from './pages/student/student';
import { Teacher } from './pages/teacher/teacher';
import { TeacherApplication } from './pages/teacher-application/teacher-application';
import { TeacherPending } from './pages/teacher-pending/teacher-pending';
import { AdminFormateurs } from './pages/admin-formateurs/admin-formateurs';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'admin', component: Admin },
  { path: 'student', component: Student },
  { path: 'teacher', component: Teacher },
  { path: 'teacher-application', component: TeacherApplication },
  { path: 'teacher-pending', component: TeacherPending },
  { path: 'admin-formateurs', component: AdminFormateurs },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}