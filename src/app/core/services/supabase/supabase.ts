import { Injectable, PLATFORM_ID, Inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Supabase {
  public supabase!: SupabaseClient;

  currentUser = signal<any>(null);
  currentRole = signal<'client' | 'artisan' | null>(null);
  isInitialLoadDone = signal<boolean>(false);
  unreadOrdersCount = signal<number>(0);
  ordersChanged = signal<number>(0);
  unreadJobsCount = signal<number>(0);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    if (isPlatformBrowser(this.platformId)) {
      this.initSession();
    }
  }

  get client() { return this.supabase; }

  private initSession() {
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        this.fetchProfile(session.user.id);
      } else {
        this.isInitialLoadDone.set(true);
        this.unreadOrdersCount.set(0);
        this.unreadJobsCount.set(0);
      }
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this.unreadOrdersCount.set(0); 
        this.unreadJobsCount.set(0);
        this.fetchProfile(session.user.id);
      } else {
        this.currentUser.set(null);
        this.currentRole.set(null);
        this.unreadOrdersCount.set(0);
        this.unreadJobsCount.set(0);
      }
    });
  }

  // ✅ تحديث دالة جلب البروفايل لتكون أكثر أماناً وتدعم الـ Z-index Fix
  async fetchProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        this.currentUser.set(data);
        this.currentRole.set(data.role);
        this.setupRealtime(userId, data.role);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      this.isInitialLoadDone.set(true);
    }
  }

  // ✅ دالة فحص الجلسة يدوياً (لحل مشكلة اختفاء النافبار)
  async checkUserSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      await this.fetchProfile(session.user.id);
    } else {
      this.isInitialLoadDone.set(true);
    }
  }

  // 🔥 دالة جلب بيانات الحرفي كاملة (البروفايل + تفاصيل الحرفي) - للديناميك
  async getArtisanFullProfile(artisanId: string) {
    return await this.supabase
      .from('profiles')
      .select(`
        *,
        artisan_details (*)
      `)
      .eq('id', artisanId)
      .single();
  }

  // 🔥 دالة جلب التقييمات الخاصة بالحرفي لعرضها في البروفايل
  async getArtisanReviews(artisanId: string) {
    return await this.supabase
      .from('orders')
      .select(` 
        rating,
        review,
        created_at,
        client_profile:profiles!client_id (full_name, avatar_url)
      `)
      .eq('artisan_id', artisanId)
      .eq('status', 'completed')
      .not('rating', 'is', null)
      .order('created_at', { ascending: false });
  }

  // 🔥 دالة رفع صورة المشكلة عند الحجز
  async uploadProblemImage(file: File) {
    const userId = this.currentUser()?.id;
    if (!userId) throw new Error('User not logged in');
    
    const fileExt = file.name.split('.').pop();
    const filePath = `problems/${userId}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await this.supabase.storage.from('orders_images').upload(filePath, file);
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = this.supabase.storage.from('orders_images').getPublicUrl(filePath);
    return publicUrl;
  }

  // ✅ تعديل دالة إنشاء الطلب لدعم تفاصيل المشكلة وصورتها (6 متغيرات)
  createOrder(
    artisanId: string,
    profession: string,
    description: string,
    imageUrl: string | null,
    clientLat: number | null,
    clientLng: number | null
  ): Observable<any> {
    return from(this.supabase.from('orders').insert({
      client_id: this.currentUser().id,
      artisan_id: artisanId,
      profession_name: profession,
      status: 'pending',
      description: description,
      problem_image_url: imageUrl, 
      client_lat: clientLat,
      client_lng: clientLng
    })).pipe(tap(() => this.updateUnreadCount(this.currentUser().id)));
  }


  

  signUp(email: string, password: string, fullName: string, phone: string, role: 'client' | 'artisan'): Observable<any> {
    if (!this.supabase) return of({ data: null, error: { message: 'SSR Error' } });
    
    return from(
      this.supabase.auth.signUp({ 
        email, 
        password, 
        options: { 
          data: { full_name: fullName, phone: phone, role: role } 
        } 
      })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) return of({ data: null, error });
        
        if (data.user) {
          // التعديل السحري: استخدام upsert بدلاً من insert لمنع ضربة الـ Primary Key الـ 500
          return from(this.supabase.from('profiles').upsert({
            id: data.user.id, 
            full_name: fullName, 
            phone: phone, 
            email: email, 
            role: role
          })).pipe(
            map(({ error: profileError }) => {
              if (profileError) return { data: null, error: profileError };
              this.fetchProfile(data.user!.id);
              return { data, error: null };
            }),
            catchError((err) => of({ data: null, error: { message: err.message || 'Profile Error' } }))
          );
        }
        return of({ data, error: null });
      }),
      catchError((err) => of({ data: null, error: err }))
    );
  }

  signIn(email: string, password: string): Observable<any> {
    if (!this.supabase) return of(null);
    return from(this.supabase.auth.signInWithPassword({ email, password })).pipe(
      tap(({ data, error }) => {
        if (data?.user && !error) this.fetchProfile(data.user.id);
      })
    );
  }

  signOut(): Observable<any> {
    if (!this.supabase) return of(null);
    return from(this.supabase.auth.signOut()).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.currentRole.set(null);
        this.unreadOrdersCount.set(0); 
        this.unreadJobsCount.set(0);
        localStorage.removeItem('selectedRole');
      })
    );
  }

  getUser(): Observable<any> {
    if (!this.supabase) return of({ error: { message: 'SSR Initialization' } });
    return from(this.supabase.auth.getUser());
  }

  getProfessionBySlug(slug: string): Observable<any> {
    if (!this.supabase) return of({ data: null, error: 'Supabase not initialized' });
    return from(this.supabase.from('professions').select('*').eq('slug', slug).single()).pipe(
      map(({ data, error }) => { if (error) throw error; return data; })
    );
  }

  getNearbyArtisans(lat: number, lng: number, profession: string): Observable<any[]> {
    return from(this.supabase.rpc('get_nearby_artisans', { user_lat: lat, user_lng: lng, profession_name: profession })).pipe(
      map(({ data, error }) => { if (error) throw error; return data || []; })
    );
  }

  async updateUnreadCount(userId: string) {
    const { count, error } = await this.supabase.from('orders').select('*', { count: 'exact', head: true }).eq('client_id', userId).eq('status', 'pending');
    if (!error) this.unreadOrdersCount.set(count || 0);
    else this.unreadOrdersCount.set(0);
  }

  async updateProfile(updates: any) {
    const { data, error } = await this.supabase.from('profiles').update(updates).eq('id', this.currentUser().id).select().single();
    if (!error) this.currentUser.set(data);
    return { data, error };
  }

  // 🌟 [الإضافة الجديدة] دالة تحديث تفاصيل الحرفي (مثل المواعيد المتاحة) من صفحة التحكم
  async updateArtisanDetails(updates: any) {
    const userId = this.currentUser()?.id;
    if (!userId) throw new Error('User not logged in');

    // ملاحظة: تأكد إن حقل الربط بين profiles و artisan_details هو 'id' أو 'artisan_id' وغيره هنا إذا لزم الأمر
    return await this.supabase
      .from('artisan_details')
      .update(updates)
      .eq('id', userId); 
  }

async uploadAvatar(file: File) {
  const userId = this.currentUser().id;
  const filePath = `${userId}/${Date.now()}_${file.name}`;
  
  const { error: uploadError } = await this.supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });
  if (uploadError) throw uploadError;
  
  const { data: { publicUrl } } = this.supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // ✅ حفظ في profiles
  await this.updateProfile({ avatar_url: publicUrl });

  // ✅ حفظ في artisans كمان عشان يظهر في artisan-profile
  await this.supabase
    .from('artisans')
    .update({ profile_pic_url: publicUrl })
    .eq('id', userId);

  return publicUrl;
}

  async changeEmail(newEmail: string) { return await this.supabase.auth.updateUser({ email: newEmail }); }
  async changePassword(newPassword: string) { return await this.supabase.auth.updateUser({ password: newPassword }); }

  async deleteAccount() {
    const userId = this.currentUser().id;
    const { error } = await this.supabase.from('profiles').delete().eq('id', userId);
    if (!error) await this.supabase.auth.signOut();
    return { error };
  }

  async getTotalOrdersCount(userId: string) {
    const { count, error } = await this.supabase.from('orders').select('*', { count: 'exact', head: true }).eq('client_id', userId);
    return count || 0;
  }

  private ordersChannel: any;

  private setupRealtime(userId: string, role: string) {
    if (this.ordersChannel) {
      this.supabase.removeChannel(this.ordersChannel);
    }

    this.updateCounts(userId, role);
    const filter = role === 'client' ? `client_id=eq.${userId}` : `artisan_id=eq.${userId}`;
    this.ordersChannel = this.supabase.channel('orders-channel');

    this.ordersChannel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: filter }, 
      (payload: any) => {
        this.updateCounts(userId, role);
        this.ordersChanged.update(v => v + 1);
      })
      .subscribe();
  }

  async updateCounts(userId: string, role: string) {
    if (role === 'client') {
      const { count } = await this.supabase.from('orders').select('*', { count: 'exact', head: true }).eq('client_id', userId).eq('status', 'pending');
      this.unreadOrdersCount.set(count || 0);
    } else {
      const { count } = await this.supabase.from('orders').select('*', { count: 'exact', head: true }).eq('artisan_id', userId).eq('status', 'pending');
      this.unreadJobsCount.set(count || 0);
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    return await this.supabase.from('orders').update({ status }).eq('id', orderId);
  }

  async submitReview(orderId: string, rating: number, review: string) {
    return await this.supabase.from('orders').update({ rating, review }).eq('id', orderId);
  }

  async getArtisanOrders() {
    const user = this.currentUser();
    return await this.client
      .from('orders')
      .select(`*, client_profile:profiles!client_id (full_name, avatar_url, phone)`)
      .eq('artisan_id', user.id)
      .order('created_at', { ascending: false });
  }

  async updateOrderData(orderId: string, payload: any) {
    return await this.supabase.from('orders').update(payload).eq('id', orderId);
  }

  async getCompletedOrders(userId: string) {
    return await this.supabase
      .from('orders')
      .select(`*, artisan_details:artisans!fk_artisan_details (full_name, profile_pic_url)`)
      .eq('client_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
  }

  async getRecentActivity(userId: string) {
    return await this.supabase
      .from('orders')
      .select(`*, artisan_details:artisans!fk_artisan_details (full_name)`)
      .eq('client_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);
  }






  // تحديث البيانات الأساسية (الاسم، المهنة، التليفون)
  async updateBasicProfile(updates: any) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', this.currentUser().id)
      .select()
      .single();
    if (!error) this.currentUser.set({ ...this.currentUser(), ...data });
    return { data, error };
  }



  // رفع صور المعرض
async uploadPortfolioImage(file: File): Promise<string> {
  const user = this.currentUser();
  if (!user) throw new Error('User not found');

  // تنظيف اسم الملف من المسافات والرموز
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `portfolio/${user.id}/${fileName}`;

  const { data, error } = await this.supabase.storage
    .from('portfolio_images') // تأكد أن الاسم مطابق تماماً للـ Bucket في Supabase
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // الحصول على الرابط العام
  const { data: { publicUrl } } = this.supabase.storage
    .from('portfolio_images')
    .getPublicUrl(filePath);

  return publicUrl;
}






// --- 🛠️ دوال البروفايل وتفاصيل الحرفي (جديد ومعدل) ---

  /**
   * 1. جلب بيانات الحرفي كاملة (Profile + Details) بـ Join واحد
   */


  /**
   * 2. حساب إحصائيات الحرفي (التقييم وعدد المهمات)
   */
  async getArtisanStats(artisanId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('rating')
      .eq('artisan_id', artisanId)
      .eq('status', 'completed');

    if (error) return { count: 0, average: 0 };

    const count = data?.length || 0;
    const totalRating = data?.reduce((acc, curr) => acc + (curr.rating || 0), 0) || 0;
    const average = count > 0 ? totalRating / count : 0;

    return { count, average };
  }

  /**
   * 3. دالة إضافة أو تحديث بيانات الحرفي (Upsert)
   */
  async upsertArtisanDetails(updates: any) {
    const userId = this.currentUser()?.id;
    if (!userId) throw new Error('User not logged in');

    const { data, error } = await this.supabase
      .from('artisan_details')
      .upsert({ id: userId, ...updates })
      .select()
      .single();

    if (!error && data) {
      const current = this.currentUser();
      this.currentUser.set({ ...current, artisan_details: data });
    }
    return { data, error };
  }

  /**
   * 4. دالة موحدة لرفع الصور لأي باكت (avatars, portfolio_images, problem_images)
   */
  async uploadImage(file: File, bucket: string): Promise<string> {
    const user = this.currentUser();
    if (!user) throw new Error('User not found');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  }
  




  // في الـ Auth Service بتاعك
async loginWithGoogle() {
  const { data, error } = await this.supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Error:', error.message);
  }
}


}

