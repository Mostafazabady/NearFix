import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'artisan-profile/:id',
    renderMode: RenderMode.Client // <--- السطر ده بيحل الأزمة فوراً
  },
  {
    path: 'OrderService/:slug',
    renderMode: RenderMode.Client // <--- السطر ده بيحل الأزمة فوراً
  },
];
