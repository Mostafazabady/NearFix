import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { isPlatformBrowser, registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar'; // استيراد بيانات اللغة العربية
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
registerLocaleData(localeAr);

bootstrapApplication(App, appConfig)
.then((appRef) => {
    const router = appRef.injector.get(Router);
    const platformId = appRef.injector.get(PLATFORM_ID); // ✅ جلب معرف البيئة
    
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // ✅ تأمين كود الـ Scroll عشان يشتغل في المتصفح فقط وما يزعلش السيرفر
        if (isPlatformBrowser(platformId)) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      });
  })
  .catch((err) => console.error(err));
