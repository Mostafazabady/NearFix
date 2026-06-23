// import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Supabase } from '../../core/services/supabase/supabase';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-order-service',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './order-service.html',
//   styleUrl: './order-service.scss',
// })
// export class OrderService implements OnInit {
//   professionData = signal<any>(null);
//   isLoading = signal<boolean>(true);
//   hasError = signal<boolean>(false);
  
//   // سجنالات الموقع
//   userLocation = signal<{lat: number, lng: number} | null>(null);
//   addressText = signal<string>(''); // لنص العنوان في الـ Input
  
//   // سجنال للحرفيين والتحميل الخاص بالبحث
//   isSearching = signal<boolean>(false);
//   nearbyPros = signal<any[]>([]);

//   selectedArtisanId = signal<string | null>(null);

//   constructor(
//     private route: ActivatedRoute,
//     private supabaseService: Supabase,
//     private cdr: ChangeDetectorRef,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.route.paramMap.subscribe(params => {
//       const slug = params.get('slug');
//       if (slug) this.loadProfession(slug);
//     });
//   }

//   private loadProfession(slug: string): void {
//     this.isLoading.set(true);
//     this.supabaseService.getProfessionBySlug(slug).subscribe({
//       next: (data) => {
//         this.professionData.set(data);
//         this.isLoading.set(false);
//         this.cdr.detectChanges();
//       },
//       error: () => {
//         this.hasError.set(true);
//         this.isLoading.set(false);
//       }
//     });
//   }

//   // دالة تحديد الموقع التلقائي
//   detectLocation() {
//     if (navigator.geolocation) {
//       // أنيميشن بسيط أثناء الجلب
//       this.addressText.set('جاري تحديد موقعك...');
      
//       navigator.geolocation.getCurrentPosition((pos) => {
//         const coords = {
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude
//         };
//         this.userLocation.set(coords);
        
//         // محاكاة لكتابة العنوان (مستقبلاً ممكن تستخدم Reverse Geocoding)
//         this.addressText.set(`موقعك الحالي: (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
//         this.cdr.detectChanges();
//       }, (error) => {
//         this.addressText.set('فشل تحديد الموقع، يرجى الإدخال يدوياً');
//       });
//     }
//   }

//  // عدل دالة searchNearby لتصبح هكذا:
// // دالة البحث الحقيقية
// searchNearby() {
//   const coords = this.userLocation();
//   const profession = this.professionData()?.name_ar; 

//   if (!coords) {
//     Swal.fire('تنبيه', 'يرجى تحديد موقعك أولاً عن طريق زر "تحديد موقعي"', 'warning');
//     return;
//   }

//   this.isSearching.set(true);
  
//   // نداء الدالة من السيرفيس
//   this.supabaseService.getNearbyArtisans(coords.lat, coords.lng, profession).subscribe({
//     next: (data) => {
//       this.nearbyPros.set(data);
//       this.isSearching.set(false);
      
//       if (data.length === 0) {
//         Swal.fire('تنبيه', 'لا يوجد فنيين مسجلين في هذه الحرفة حالياً بمنطقتك', 'info');
//       }
//       this.cdr.detectChanges();
//     },
//     error: (err) => {
//       this.isSearching.set(false);
//       console.error(err);
//       Swal.fire('خطأ', 'حدثت مشكلة أثناء جلب البيانات', 'error');
//     }
//   });
// }

// // دالة تنسيق المسافة (تأكد إنها موجودة داخل الكلاس)
// formatDistance(meters: number | undefined): string {
//   if (meters === undefined || meters === null) return 'غير معروف';
//   if (meters < 1000) return `${Math.round(meters)} متر`;
//   return `${(meters / 1000).toFixed(1)} كم`;
// }









// selectArtisan(id: string) {
//   this.selectedArtisanId.set(id);
// }










// confirmFinalOrder() {
//   const artisanId = this.selectedArtisanId();
//   const profession = this.professionData()?.name_ar;

//   if (!artisanId) {
//     Swal.fire('تنبيه', 'يرجى اختيار حرفي أولاً', 'info');
//     return;
//   }

//   // إظهار لودر بسيط أثناء المعالجة
//   Swal.fire({ title: 'جاري إرسال طلبك...', didOpen: () => Swal.showLoading() });

//   this.supabaseService.createOrder(artisanId, profession).subscribe({
//     next: (res) => {
//       Swal.close();
//       if (res.error) throw res.error;

//       Swal.fire({
//         title: 'تم إرسال طلبك بنجاح!',
//         text: 'سيتم توجيهك الآن لمتابعة الطلب',
//         icon: 'success',
//         timer: 2000,
//         showConfirmButton: false
//       }).then(() => {
//         this.router.navigate(['/ClientOrder']);
//       });
//     },
//     error: (err) => {
//       Swal.fire('خطأ', 'فشل في إرسال الطلب، حاول مرة أخرى', 'error');
//       console.error(err);
//     }
//   });
// }








// }


































import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Supabase } from '../../core/services/supabase/supabase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-service',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-service.html',
  styleUrl: './order-service.scss',
})
export class OrderService implements OnInit {
  professionData = signal<any>(null);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  
  // سجنالات الموقع
  userLocation = signal<{lat: number, lng: number} | null>(null);
  addressText = signal<string>('');
  
  // سجنال للحرفيين والتحميل الخاص بالبحث
  isSearching = signal<boolean>(false);
  nearbyPros = signal<any[]>([]);

  selectedArtisanId = signal<string | null>(null);

  // ✅ سجنال جديد لتفاصيل المشكلة
  problemDescription = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private supabaseService: Supabase,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) this.loadProfession(slug);
    });
  }

  private loadProfession(slug: string): void {
    this.isLoading.set(true);
    this.supabaseService.getProfessionBySlug(slug).subscribe({
      next: (data) => {
        this.professionData.set(data);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  detectLocation() {
    if (navigator.geolocation) {
      this.addressText.set('جاري تحديد موقعك...');
      
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        this.userLocation.set(coords);
        this.addressText.set(`موقعك الحالي: (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
        this.cdr.detectChanges();
      }, (error) => {
        this.addressText.set('فشل تحديد الموقع، يرجى الإدخال يدوياً');
      });
    }
  }

  searchNearby() {
    const coords = this.userLocation();
    const profession = this.professionData()?.name_ar; 

    if (!coords) {
      Swal.fire('تنبيه', 'يرجى تحديد موقعك أولاً عن طريق زر "تحديد موقعي"', 'warning');
      return;
    }

    this.isSearching.set(true);
    
    this.supabaseService.getNearbyArtisans(coords.lat, coords.lng, profession).subscribe({
      next: (data) => {
        this.nearbyPros.set(data);
        this.isSearching.set(false);
        
        if (data.length === 0) {
          Swal.fire('تنبيه', 'لا يوجد فنيين مسجلين في هذه الحرفة حالياً بمنطقتك', 'info');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSearching.set(false);
        console.error(err);
        Swal.fire('خطأ', 'حدثت مشكلة أثناء جلب البيانات', 'error');
      }
    });
  }

  formatDistance(meters: number | undefined): string {
    if (meters === undefined || meters === null) return 'غير معروف';
    if (meters < 1000) return `${Math.round(meters)} متر`;
    return `${(meters / 1000).toFixed(1)} كم`;
  }

  selectArtisan(id: string) {
    this.selectedArtisanId.set(id);
  }

  confirmFinalOrder() {
  const artisanId = this.selectedArtisanId();
  const profession = this.professionData()?.name_ar;
  const description = this.problemDescription().trim();

  if (!artisanId) {
    Swal.fire('تنبيه', 'يرجى اختيار حرفي أولاً', 'info');
    return;
  }

  if (!description) {
    Swal.fire('تنبيه', 'يرجى كتابة تفاصيل المشكلة أولاً', 'info');
    return;
  }

  // ✅ لو الموقع موجود بالفعل، ابعت الطلب مباشرة
  const existingCoords = this.userLocation();
  if (existingCoords) {
    this.sendOrder(artisanId, profession, description, null, existingCoords.lat, existingCoords.lng);
    return;
  }

  // ✅ لو الموقع مش موجود، اجيبه أوتوماتيك الأول
  Swal.fire({ title: 'جاري تحديد موقعك...', didOpen: () => Swal.showLoading() });

  if (!navigator.geolocation) {
    Swal.close();
    Swal.fire('تنبيه', 'متصفحك لا يدعم تحديد الموقع', 'warning');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      this.userLocation.set(coords);
      Swal.close();
      this.sendOrder(artisanId, profession, description, null, coords.lat, coords.lng);
    },
    (_err) => {
      Swal.close();
      // ✅ لو رفض الصلاحية، ابعت الطلب من غير موقع
      Swal.fire({
        title: 'تعذر تحديد موقعك',
        text: 'سيتم إرسال الطلب بدون موقع، هل تريد الاستمرار؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، أرسل الطلب',
        cancelButtonText: 'إلغاء'
      }).then(result => {
        if (result.isConfirmed) {
          this.sendOrder(artisanId, profession, description, null, null, null);
        }
      });
    }
  );
}

// ✅ دالة مساعدة منفصلة لإرسال الطلب
private sendOrder(
  artisanId: string,
  profession: string,
  description: string,
  imageUrl: string | null,
  lat: number | null,
  lng: number | null
) {
  Swal.fire({ title: 'جاري إرسال طلبك...', didOpen: () => Swal.showLoading() });

  this.supabaseService.createOrder(artisanId, profession, description, imageUrl, lat, lng).subscribe({
    next: (res) => {
      Swal.close();
      if (res.error) throw res.error;

      Swal.fire({
        title: 'تم إرسال طلبك بنجاح!',
        text: 'سيتم توجيهك الآن لمتابعة الطلب',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        this.router.navigate(['/ClientOrder']);
      });
    },
    error: (err) => {
      Swal.fire('خطأ', 'فشل في إرسال الطلب، حاول مرة أخرى', 'error');
      console.error(err);
    }
  });
}



}