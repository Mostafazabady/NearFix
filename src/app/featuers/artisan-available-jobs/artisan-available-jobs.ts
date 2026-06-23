import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supabase } from '../../core/services/supabase/supabase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-artisan-available-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artisan-available-jobs.html',
  styleUrl: './artisan-available-jobs.scss'
})
export class ArtisanAvailableJobs implements OnInit {
  jobs = signal<any[]>([]);
  isLoading = signal(true);

  constructor(private supabase: Supabase) {
    effect(() => {
      if (this.supabase.ordersChanged() || this.supabase.currentUser()) {
        this.fetchJobs();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.fetchJobs();
  }

  async fetchJobs() {
    const user = this.supabase.currentUser();
    if (!user) return;

    // ✅ التعديل هنا: شيلنا حالة 'completed' عشان الكروت المكتملة تختفي تماماً من الصفحة دي بعد تفعيلها
    const { data, error } = await this.supabase.client
      .from('orders')
      .select(`
        *, 
        client_details:profiles!client_id (full_name, avatar_url, email, phone)
      `)
      .eq('artisan_id', user.id)
      .in('status', ['pending', 'accepted']) 
      .order('created_at', { ascending: false });

    if (!error) {
      this.jobs.set(data || []);
    }
    this.isLoading.set(false);
  }

  // دالة فتح واتساب العميل
  openWhatsApp(phone: string) {
    if (!phone) {
      Swal.fire('تنبيه', 'رقم هاتف العميل غير مسجل', 'info');
      return;
    }
    const cleanPhone = phone.replace(/\s+/g, '').replace('+', '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  }

  async handleJob(orderId: string, status: 'accepted' | 'rejected') {
    const isAccept = status === 'accepted';
    const result = await Swal.fire({
      title: isAccept ? 'هل توافق على العمل؟' : 'هل تريد رفض الطلب؟',
      text: isAccept ? 'بمجرد القبول سيظهر موقع العميل ورقم هاتفه لك' : 'سيتم إغلاق هذا الطلب',
      icon: isAccept ? 'success' : 'warning',
      showCancelButton: true,
      confirmButtonText: isAccept ? 'قبول العمل' : 'رفض',
      cancelButtonText: 'تراجع',
      confirmButtonColor: isAccept ? '#22c55e' : '#ef4444'
    });

    if (result.isConfirmed) {
      const { error } = await this.supabase.updateOrderStatus(orderId, status);
      if (!error) {
        Swal.fire(isAccept ? 'تم القبول!' : 'تم الرفض', '', 'success');
        this.fetchJobs();
      }
    }
  }

  // ✅ الدالة المحدثة لإنهاء العمل وحذف الكارت فوراً من الواجهة بشكل انسيابي وعملي
  async completeJob(orderId: string) {
    const result = await Swal.fire({
      title: 'هل أنهيت العمل؟',
      text: 'بمجرد التأكيد سيتم نقل الطلب لأرشيف أعمالك المنفذة وسيتمكن العميل من تقييمك',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، تم الانتهاء',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#4f46e5'
    });

    if (result.isConfirmed) {
      const { error } = await this.supabase.updateOrderStatus(orderId, 'completed');
      if (!error) {
        Swal.fire('ممتاز!', 'تم إغلاق الطلب بنجاح ونقله لملفك الشخصي', 'success');
        
        // التحديث اللحظي: فلترة الكارت الحالي من السجنال مباشرة لتوفير استجابة بصرية فائقة السرعة
        this.jobs.update(currentJobs => currentJobs.filter(job => job.id !== orderId));
        
        // إعادة المزامنة مع السيرفر احتياطياً وتحديث الأعداد بدقة
        this.fetchJobs();
      }
    }
  }

  openGoogleMaps(lat: number, lng: number) {
    if (lat && lng) {
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      Swal.fire('تنبيه', 'موقع العميل غير متوفر لهذا الطلب', 'info');
    }
  }

  getStars(rating: number): number[] {
    return Array(rating || 0).fill(0);
  }

  openImageFullscreen(url: string) {
    Swal.fire({
      imageUrl: url,
      imageAlt: 'صورة المشكلة',
      showConfirmButton: false,
      showCloseButton: true,
      width: '90%'
    });
  }
}