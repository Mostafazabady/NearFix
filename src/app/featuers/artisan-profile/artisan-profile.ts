import { Component, OnInit, signal, computed, inject, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Supabase } from '../../core/services/supabase/supabase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-artisan-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artisan-profile.html',
  styleUrl: './artisan-profile.scss'
})
export class ArtisanProfile implements OnInit {
  private route    = inject(ActivatedRoute);
  private supabase = inject(Supabase);

  artisanId   = '';
  profileData = signal<any>(null);
  isLoading   = signal(true);
  rawRatings  = signal<number[]>([]);
  dataFetched = false;

  // ✅ إحصائيات
  completedCount = signal(0);

  averageRating = computed(() => {
    const r = this.rawRatings();
    if (!r.length) return 0;
    return +(r.reduce((a, b) => a + b, 0) / r.length).toFixed(1);
  });

  // ✅ رضا العملاء - نسبة التقييمات >= 4 من الكل
  satisfactionPct = computed(() => {
    const r = this.rawRatings();
    if (!r.length) return 0;
    return Math.round((r.filter(x => x >= 4).length / r.length) * 100);
  });

  // ✅ الإيموجي بناءً على النسبة
  satisfactionEmoji = computed(() => {
    const pct = this.satisfactionPct();
    if (pct >= 80) return '😍';
    if (pct >= 60) return '🙂';
    if (pct >= 40) return '😐';
    return '😞';
  });

  // ✅ سرعة الاستجابة - من DB أو default
  responseTime = computed(() =>
    this.profileData()?.artisan_details?.response_time || '30-60 دقيقة'
  );

  starsArr = computed(() =>
    [1, 2, 3, 4, 5].map(i => i <= Math.round(this.averageRating()))
  );



  // ✅ Gallery signals
showLightbox   = signal(false);
lightboxIndex  = signal(0);
showAllImages  = signal(false);
// ✅ أضف مع باقي الـ signals
reviews = signal<any[]>([]);
// ✅ Slider
sliderIndex = signal(0);

  constructor() {
    effect(() => {
      const done = this.supabase.isInitialLoadDone();
      if (done && this.artisanId && !this.dataFetched) {
        this.dataFetched = true;
        this.loadData();
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
onKeydown(e: KeyboardEvent) {
  if (!this.showLightbox()) return;
  if (e.key === 'ArrowLeft')  this.lbNext();
  if (e.key === 'ArrowRight') this.lbPrev();
  if (e.key === 'Escape')     this.closeLightbox();
}

  ngOnInit() {
    this.artisanId = this.route.snapshot.paramMap.get('id') || '';
    if (this.supabase.isInitialLoadDone() && this.artisanId && !this.dataFetched) {
      this.dataFetched = true;
      this.loadData();
    }
  }

  async loadData() {
    this.isLoading.set(true);

    try {
      // 1. جلب بيانات الحرفي
      const { data: artisanData, error: artisanError } = await this.supabase.client
        .from('artisans')
        .select('*')
        .eq('id', this.artisanId)
        .single();

      if (artisanData && !artisanError) {
        const { data: detailsData } = await this.supabase.client
          .from('artisan_details')
          .select('*')
          .eq('id', this.artisanId)
          .single();

        this.profileData.set({
          ...artisanData,
          artisan_details: detailsData || null
        });
      } else {
        const { data: profileData } = await this.supabase.client
          .from('profiles')
          .select(`*, artisan_details(*)`)
          .eq('id', this.artisanId)
          .single();

        if (profileData) this.profileData.set(profileData);
      }

      // 2. ✅ جلب التقييمات + عدد المهام المكتملة في query واحد
      const { data: ordersData } = await this.supabase.client
        .from('orders')
        .select('rating')
        .eq('artisan_id', this.artisanId)
        .eq('status', 'completed');

      if (ordersData?.length) {
        // عدد المهام المكتملة
        this.completedCount.set(ordersData.length);

        // التقييمات الموجودة فقط (لو العميل قيّم)
        const ratings = ordersData
          .filter((o: any) => o.rating !== null)
          .map((o: any) => o.rating);
        this.rawRatings.set(ratings);
      }

    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }



    // 2. ✅ جلب التقييمات + الريفيوز + عدد المهام في query واحد
const { data: ordersData } = await this.supabase.client
  .from('orders')
  .select(`
    rating,
    review,
    created_at,
    client_profile:profiles!client_id (full_name, avatar_url)
  `)
  .eq('artisan_id', this.artisanId)
  .eq('status', 'completed')
  .order('created_at', { ascending: false });

if (ordersData?.length) {
  this.completedCount.set(ordersData.length);

  const ratings = ordersData
    .filter((o: any) => o.rating !== null)
    .map((o: any) => o.rating);
  this.rawRatings.set(ratings);

  // ✅ فلتر الريفيوز - اللي عندهم تقييم بس
  const reviewsWithRating = ordersData.filter((o: any) => o.rating !== null);
  this.reviews.set(reviewsWithRating);
}




  }

  starsArrFromNum(n: number): boolean[] {
  return [1, 2, 3, 4, 5].map(i => i <= Math.round(n));
}

  // باقي الدوال زي ما هي
async openBookingModal() {
  if (!this.supabase.currentUser()) {
    Swal.fire({
      icon: 'warning',
      title: 'تنبيه',
      text: 'يرجى تسجيل الدخول أولاً لإتمام الحجز',
      confirmButtonText: 'حسناً',
      confirmButtonColor: '#4f46e5'
    });
    return;
  }

  const { value } = await Swal.fire({
    title: `<span style="font-size: 20px; font-weight: 700;">احجز مع ${this.getName()}</span>`,
    html: `
      <div style="text-align: right; padding: 10px;">
        <label style="font-size: 14px; color: #374151; font-weight: 600; margin-bottom: 8px; display: block;">تفاصيل المشكلة</label>
        <textarea dir="rtl" id="sd" class="swal2-textarea" placeholder="اشرح المشكلة بالتفصيل..." 
          style="margin: 0; width: 100%; border-radius: 12px; border: 1px solid #d1d5db; min-height: 120px;"></textarea>
        
        <div style="margin-top: 20px;">
          <label style="font-size: 14px; color: #374151; font-weight: 600; display: block; margin-bottom: 8px;">صورة للمشكلة (اختياري)</label>
          <input type="file" id="sf" accept="image/*" style="width: 100%; padding: 10px; border: 1px dashed #9ca3af; border-radius: 12px; cursor: pointer;">
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'تأكيد الطلب',
    cancelButtonText: 'إلغاء',
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#9ca3af',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-xl shadow-lg',
      confirmButton: 'px-6 py-2 rounded-lg font-bold',
      cancelButton: 'px-6 py-2 rounded-lg font-bold'
    },
    preConfirm: () => {
      const desc = (document.getElementById('sd') as HTMLTextAreaElement).value.trim();
      const file = (document.getElementById('sf') as HTMLInputElement).files?.[0] ?? null;
      if (!desc) {
        Swal.showValidationMessage('يرجى كتابة تفاصيل المشكلة أولاً');
        return false;
      }
      return { desc, file };
    }
  });

  if (value) this.sendOrder(value.desc, value.file);
}




  async sendOrder(description: string, imageFile: File | null) {
    Swal.fire({ title: 'جاري إرسال طلبك...', didOpen: () => Swal.showLoading() });
    try {
      let imageUrl: string | null = null;
      if (imageFile) imageUrl = await this.supabase.uploadImage(imageFile, 'problem_images');

      const getLocation = (): Promise<{lat: number; lng: number} | null> =>
        new Promise(resolve => {
          if (!navigator.geolocation) { resolve(null); return; }
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null), { timeout: 5000 }
          );
        });

      const coords = await getLocation();
      const profession = this.profileData()?.profession ||
                         this.profileData()?.artisan_details?.profession || 'غير محدد';

      this.supabase.createOrder(
        this.artisanId, profession, description, imageUrl,
        coords?.lat ?? null, coords?.lng ?? null
      ).subscribe({
        next: () => Swal.fire('تم!', 'سيتواصل معك الحرفي قريباً ✅', 'success'),
        error: () => Swal.fire('خطأ', 'فشل إرسال الطلب', 'error')
      });
    } catch (e) {
      Swal.fire('خطأ', 'فشل رفع الصورة أو إرسال الطلب', 'error');
    }
  }

  openWhatsApp() {
    const phone = this.profileData()?.phone || this.profileData()?.artisan_details?.phone;
    if (phone) {
      const cleaned = phone.replace(/\D/g, '');
      const withCode = cleaned.startsWith('2') ? cleaned : `2${cleaned}`;
      window.open(`https://wa.me/${withCode}`, '_blank');
    }
  }

getAvatar(): string {
  return this.profileData()?.profile_pic_url  // artisans table
      || this.profileData()?.avatar_url        // profiles table (fallback)
      || '/images/avatarImage.png';
}

  getName(): string { return this.profileData()?.full_name || ''; }

  getProfession(): string {
    return this.profileData()?.profession ||
           this.profileData()?.artisan_details?.profession || '';
  }

  getBio(): string { return this.profileData()?.artisan_details?.bio || ''; }

  getSkills(): string[] { return this.profileData()?.artisan_details?.skills || []; }





// ✅ الصور المعروضة (3 بس أو كل)
displayedImages = computed(() => {
  const imgs = this.getPortfolioImages();
  return this.showAllImages() ? imgs : imgs.slice(0, 3);
});

getPortfolioImages(): string[] {
  return this.profileData()?.artisan_details?.portfolio_images || [];
}

// ✅ Lightbox controls
openLightbox(index: number) {
  this.lightboxIndex.set(index);
  this.showLightbox.set(true);
  document.body.style.overflow = 'hidden';
}

closeLightbox() {
  this.showLightbox.set(false);
  document.body.style.overflow = '';
}

lbNext() {
  const total = this.getPortfolioImages().length;
  this.lightboxIndex.update(i => (i + 1) % total);
}

lbPrev() {
  const total = this.getPortfolioImages().length;
  this.lightboxIndex.update(i => (i - 1 + total) % total);
}

// ✅ مشاهدة الكل - يفتح الـ lightbox على أول صورة
viewAll() {
  this.openLightbox(0);
}




sliderNext() {
  if (this.sliderIndex() < this.reviews().length - 1) {
    this.sliderIndex.update(i => i + 1);
  }
}

sliderPrev() {
  if (this.sliderIndex() > 0) {
    this.sliderIndex.update(i => i - 1);
  }
}




}