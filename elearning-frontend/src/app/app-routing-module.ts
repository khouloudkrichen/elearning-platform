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
import { Courses } from './pages/admin-cours/admin-cours';
import { TeacherProfile } from './pages/teacher-profile/teacher-profile';
import { AdminCoursDetail } from './pages/admin-cours-detail/admin-cours-detail';

const routes: Routes = [
  { path: '',                  redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',             component: Login },
  { path: 'register',          component: Register },
  { path: 'admin',             component: Admin },
  { path: 'student',           component: Student },
  { path: 'teacher',           component: Teacher },
  { path: 'teacher-application', component: TeacherApplication },
  { path: 'teacher-pending',   component: TeacherPending },
  { path: 'admin-formateurs',  component: AdminFormateurs },
  { path: 'admin-cours',       component: Courses },
  { path: 'teacher-profile', component: TeacherProfile },
  { path: 'admin/formations/:id', component: AdminCoursDetail },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}