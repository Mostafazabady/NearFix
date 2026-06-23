import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Supabase } from '../../core/services/supabase/supabase';

@Component({
  selector: 'app-client-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-order.html',
  styleUrl: './client-order.scss',
})
export class ClientOrder implements OnInit {
  orders = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  inlineRatingData: Record<string, number> = {};

  constructor(private supabase: Supabase) {
    effect(() => {
      if (this.supabase.currentUser() && this.supabase.ordersChanged() !== -1) {
        this.fetchOrders();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() { this.fetchOrders(); }

  async fetchOrders() {
    this.isLoading.set(true);
    const user = this.supabase.currentUser();
    if (!user) {
      this.isLoading.set(false);
      return;
    }

    // ✅ استعلام مبسط وآمن تماماً لتفادي أي Syntax Error من الـ DB
    const { data, error } = await this.supabase.client
      .from('orders')
      .select(`*, artisan_details:artisans!fk_artisan_details (full_name, profile_pic_url, phone)`)
      .eq('client_id', user.id)
      .or('status.in.(pending,accepted,in_progress),status.eq.completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      this.orders.set([]);
    } else if (data) {
      // ✅ الفلترة الذكية في الـ الكلاينت:
      // الطلب الـ completed هيفضل ظاهر ومحبوس هنا بشرط إنه يكون لسه ما اتقيمش
      const dynamicOrders = data.filter((order: any) => {
        if (order.status === 'completed') {
          // ملحوظة هندسية: لو اسم عمود التقييم عندك في الجدول مختلف عن is_reviewed أو rating عدله هنا بس
          return !order.is_reviewed && !order.rating;
        }
        return true;
      });
      this.orders.set(dynamicOrders);
    }
    
    this.isLoading.set(false);
  }

  openWhatsApp(phone: string) {
    if (!phone) return;
    const cleanPhone = phone.replace(/\s+/g, '').replace('+', '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  }

  async addExtraDetails(orderId: string) {
    const { value: text } = await Swal.fire({
      title: 'إضافة تفاصيل للمشكلة',
      input: 'textarea',
      inputPlaceholder: 'مثال: الحنفية مكسورة من الداخل وتحتاج إلى قلب جديد...',
      showCancelButton: true,
      confirmButtonText: 'إرسال للحرفي'
    });
    if (text) {
      await this.supabase.updateOrderData(orderId, { problem_details: text });
      Swal.fire('تم!', 'تم إرسال التفاصيل للحرفي', 'success');
      this.fetchOrders();
    }
  }

  shareLocation(orderId: string) {
    if (navigator.geolocation) {
      Swal.fire({ title: 'جاري تحديد موقعك...', didOpen: () => Swal.showLoading() });
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        await this.supabase.updateOrderData(orderId, { client_lat: latitude, client_lng: longitude });
        Swal.fire('نجاح', 'تم إرسال موقعك للحرفي بنجاح 📍', 'success');
        this.fetchOrders();
      }, () => {
        Swal.fire('خطأ', 'يرجى تفعيل صلاحية الوصول للموقع', 'error');
      });
    }
  }

  setInlineRating(orderId: string, rating: number) {
    this.inlineRatingData[orderId] = rating;
  }

  async submitInlineReview(orderId: string, reviewText: string) {
    const rating = this.inlineRatingData[orderId] || 0;
    if (rating === 0) {
      Swal.fire('تنبيه', 'يرجى اختيار عدد النجوم للتقييم', 'info');
      return;
    }
    const { error } = await this.supabase.submitReview(orderId, rating, reviewText);
    if (!error) {
      Swal.fire('شكراً لك!', 'تم حفظ تقييمك بنجاح', 'success');
      this.fetchOrders(); // ✅ سيعيد جلب البيانات ويختفي الكارت الآن لأن الشرط لم يعد ينطبق عليه
    }
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  getStatusStep(status: string): number {
    if (status === 'pending') return 0;
    if (status === 'accepted' || status === 'in_progress') return 1;
    if (status === 'completed') return 2;
    return 0;
  }
}