// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard }    from './core/guards/auth-guard';
import { artisanGuard } from './core/guards/ArtisanGuard/artisan-guard-guard';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/navbar-layout/navbar-layout')
        .then(m => m.NavbarLayout),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      // ✅ للكل
      {
        path: 'home',
        loadComponent: () =>
          import('./featuers/home/components/home/home')
            .then(m => m.Home)
      },
      {
        path: 'WhoUs',
        loadComponent: () =>
          import('./featuers/who-Us/components/who-us/who-us')
            .then(m => m.WhoUs)
      },
      {
        path: 'join-us',
        loadComponent: () =>
          import('./featuers/join-us/components/join-us/join-us')
            .then(m => m.JoinUs)
      },
      {
        path: 'our-services',
        loadComponent: () =>
          import('./featuers/our-services/components/our-services/our-services')
            .then(m => m.OurServices)
      },
      {
        path: 'artisan-profile/:id',
        loadComponent: () =>
          import('./featuers/artisan-profile/artisan-profile')
            .then(m => m.ArtisanProfile),data: { prerender: false }
      },

      // ✅ مسجل (عميل أو حرفي)
      {
        path: 'OrderService/:slug',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./featuers/order-service/order-service')
            .then(m => m.OrderService)
      },
      {
        path: 'ClientOrder',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./featuers/client-order/client-order')
            .then(m => m.ClientOrder)
      },
      {
        path: 'client-profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./featuers/client-profile/client-profile')
            .then(m => m.ClientProfile)
      },

      // ✅ حرفي فقط
      {
        path: 'artisan-available-jobs',
        canActivate: [artisanGuard],
        loadComponent: () =>
          import('./featuers/artisan-available-jobs/artisan-available-jobs')
            .then(m => m.ArtisanAvailableJobs)
      },
      {
        path: 'update-artisan-profile',
        canActivate: [artisanGuard],
        loadComponent: () =>
          import('./featuers/update-artisan-profile/update-artisan-profile')
            .then(m => m.UpdateArtisanProfile)
      },
    ]
  },

  // ✅ Auth - زوار فقط
  {
    path: 'Auth',
    loadChildren: () =>
      import('./featuers/Auth/auth.routes')
        .then(m => m.Auth)
  },

  // ✅ 404
  {
    path: '**',
    loadComponent: () =>
      import('./featuers/not-found/not-found')
        .then(m => m.NotFound)
  },
];