import { Routes } from '@angular/router';

export const Auth: Routes = [
    {path:"Login", loadComponent: ()=>import('./pages/components/login/login/login').then((m)=> m.Login)},
    {path:"Register", loadComponent: ()=>import('./pages/components/register/register').then((m)=> m.Register)},
    {path:"artisan-signup", loadComponent: ()=>import('./pages/components/artisan-signup/artisan-signup').then((m)=> m.ArtisanSignup)},
    {path:"RoleSelection", loadComponent: ()=>import('../RoleSelection/components/role-selection/role-selection').then((m)=> m.RoleSelection)},
    {path:"PendingApproval", loadComponent: ()=>import('./pages/components/pending-approval/pending-approval').then((m)=> m.PendingApproval)},

];
