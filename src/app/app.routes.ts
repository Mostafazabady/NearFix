import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
        {path:"", loadComponent: ()=>import('./layouts/navbar-layout/navbar-layout').then((m)=> m.NavbarLayout), children:[
    {path:"", redirectTo:'home', pathMatch:'full'},
    {path:"home", loadComponent: ()=>import('./featuers/home/components/home/home').then((m)=> m.Home)},
    {path:"WhoUs", loadComponent: ()=>import('./featuers/who-Us/components/who-us/who-us').then((m)=> m.WhoUs)},
    {path:"join-us", loadComponent: ()=>import('./featuers/join-us/components/join-us/join-us').then((m)=> m.JoinUs)},
    {path:"our-services", loadComponent: ()=>import('./featuers/our-services/components/our-services/our-services').then((m)=> m.OurServices)},
    {path:"OrderService/:slug", loadComponent: ()=>import('./featuers/order-service/order-service').then((m)=> m.OrderService)},
    {path:"ClientOrder", loadComponent: ()=>import('./featuers/client-order/client-order').then((m)=> m.ClientOrder)},
    {path:"client-profile", loadComponent: ()=>import('./featuers/client-profile/client-profile').then((m)=> m.ClientProfile)},
    {path:"artisan-available-jobs", loadComponent: ()=>import('./featuers/artisan-available-jobs/artisan-available-jobs').then((m)=> m.ArtisanAvailableJobs)},
    {path:"artisan-profile/:id", loadComponent: ()=>import('./featuers/artisan-profile/artisan-profile').then((m)=> m.ArtisanProfile)},
    {path:"update-artisan-profile", loadComponent: ()=>import('./featuers/update-artisan-profile/update-artisan-profile').then((m)=> m.UpdateArtisanProfile)},
    {path:"navbar", loadComponent: ()=>import('./core/components/navbar/navbar/navbar').then((m)=> m.Navbar)},
]},
       { path: 'Auth', loadChildren: () => import('./featuers/Auth/auth.routes').then(m => m.Auth) },
        {path:"**", loadComponent: ()=>import('./featuers/not-found/not-found').then((m)=> m.NotFound)},
];
