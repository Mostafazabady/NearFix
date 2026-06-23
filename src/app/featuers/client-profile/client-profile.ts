import { Component, OnInit, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Supabase } from '../../core/services/supabase/supabase';
import { Chart, registerables } from 'chart.js';

// تسجيل مكتبة Chart.js للرسم البياني
Chart.register(...registerables);

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-profile.html',
  styleUrl: './client-profile.scss'
})
export class ClientProfile implements OnInit {
  activeTab = 'summary';

  loading = signal(false);
  totalOrders = signal(0);
  completedOrdersCount = signal(0);
  completedOrders = signal<any[]>([]);
  loadingCompleted = signal(false);
  lastOrder = signal<any>(null);
  dataLoaded = signal(false); // ✅ لمنع التكرار

  // الشارات القديمة للعميل
  allOrders = signal<any[]>([]);
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('timelineChart') timelineChartRef!: ElementRef;
  categoryChartInstance: any;
  timelineChartInstance: any;

  // ✅ الإضافات الجديدة الخاصة بالحرفي (لو الـ role حرفي)
  artisanTotalJobs = signal(0);
  artisanCompletedJobsCount = signal(0);
  artisanCompletedJobs = signal<any[]>([]);
  loadingArtisanCompleted = signal(false);
  allArtisanJobs = signal<any[]>([]);

  // مراجع عناصر البياني المخصصة للحرفي كحرفي
  @ViewChild('artisanCategoryChart') artisanCategoryChartRef!: ElementRef;
  @ViewChild('artisanTimelineChart') artisanTimelineChartRef!: ElementRef;
  artisanCategoryChartInstance: any;
  artisanTimelineChartInstance: any;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public supabase: Supabase,
    private router: Router
  ) {
    // ✅ الحل الرئيسي القديم كما هو دون أي تغيير
    effect(() => {
      const user = this.supabase.currentUser();
      if (user && !this.dataLoaded()) {
        this.dataLoaded.set(true);
        this.initForms(user);
        this.loadAllData(user.id, user.role);
      }
    });

    // ✅ تحديث التأثير لمراقبة وإعادة بناء الشارات الخاصة بالعميل والحرفي بشكل ديناميكي ومستقل
    effect(() => {
      if (this.activeTab === 'summary') {
        if (this.allOrders().length > 0) {
          setTimeout(() => this.initCharts(), 50);
        }
        // بناء شارات الحرفي فقط إذا كانت الداتا جاهزة والمستخدم حرفي بالفعل
        if (this.supabase.currentUser()?.role === 'artisan' && this.allArtisanJobs().length > 0) {
          setTimeout(() => this.initArtisanCharts(), 60);
        }
      }
    });
  }

  ngOnInit(): void {
    const user = this.supabase.currentUser();
    if (user && !this.dataLoaded()) {
      this.dataLoaded.set(true);
      this.initForms(user);
      this.loadAllData(user.id, user.role);
    }
  }

  // ✅ جلب كل البيانات الموحدة مع إضافة جلب بيانات الحرفي بشكل مشروط
  async loadAllData(userId: string, role: string) {
    // 1. استدعاء البيانات كعميل (الكود القديم دون مساس)
    const [totalCount, ordersData] = await Promise.all([
      this.supabase.getTotalOrdersCount(userId),
      this.supabase.client
        .from('orders')
        .select('id, status, profession_name, created_at, rating, review')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
    ]);

    this.totalOrders.set(totalCount);

    if (ordersData.data) {
      this.allOrders.set(ordersData.data);
      const completed = ordersData.data.filter((o: any) => o.status === 'completed');
      this.completedOrdersCount.set(completed.length);
      this.lastOrder.set(ordersData.data[0] || null);
    }

    // 2. ✅ إذا كان الحساب لحرفي، بنسحب بياناته كحرفي (الأعمال الواردة إليه من أشخاص آخرين)
    if (role === 'artisan') {
      const { data: artisanJobs, error } = await this.supabase.client
        .from('orders')
        .select('id, status, profession_name, created_at, rating, review, client_id')
        .eq('artisan_id', userId)
        .order('created_at', { ascending: false });

      if (artisanJobs) {
        this.allArtisanJobs.set(artisanJobs);
        this.artisanTotalJobs.set(artisanJobs.length);
        const completedJobs = artisanJobs.filter((j: any) => j.status === 'completed');
        this.artisanCompletedJobsCount.set(completedJobs.length);
      }
    }
  }

  // ✅ جلب الخدمات المنتهية كعميل (كودك القديم تماماً)
  async loadCompletedOrders() {
    const user = this.supabase.currentUser();
    if (!user) return;

    this.loadingCompleted.set(true);

    const { data: orders, error } = await this.supabase.client
      .from('orders')
      .select('*')
      .eq('client_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed orders:', error);
      this.loadingCompleted.set(false);
      return;
    }

    if (!orders || orders.length === 0) {
      this.completedOrders.set([]);
      this.loadingCompleted.set(false);
      return;
    }

    const artisanIds = [...new Set(orders.map((o: any) => o.artisan_id))];
    const { data: artisans } = await this.supabase.client
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', artisanIds);

    const artisanMap: any = {};
    if (artisans) {
      artisans.forEach((a: any) => artisanMap[a.id] = a);
    }

    const enriched = orders.map((o: any) => ({
      ...o,
      artisan_details: artisanMap[o.artisan_id] || null
    }));

    this.completedOrders.set(enriched);
    this.loadingCompleted.set(false);
  }

  // ✅ دالة جديدة تماماً لجلب الأعمال التي قام بها الحرفي لحساب العملاء الآخرين وتفاصيل العملاء
  async loadArtisanCompletedJobs() {
    const user = this.supabase.currentUser();
    if (!user) return;

    this.loadingArtisanCompleted.set(true);

    const { data: jobs, error } = await this.supabase.client
      .from('orders')
      .select('*')
      .eq('artisan_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error || !jobs || jobs.length === 0) {
      this.artisanCompletedJobs.set([]);
      this.loadingArtisanCompleted.set(false);
      return;
    }

    // جلب بيانات العميل (Client Profile) المربوط بكل شغلانة منتهية
    const clientIds = [...new Set(jobs.map((j: any) => j.client_id))];
    const { data: clients } = await this.supabase.client
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', clientIds);

    const clientMap: any = {};
    if (clients) {
      clients.forEach((c: any) => clientMap[c.id] = c);
    }

    const enrichedJobs = jobs.map((j: any) => ({
      ...j,
      client_details: clientMap[j.client_id] || null
    }));

    this.artisanCompletedJobs.set(enrichedJobs);
    this.loadingArtisanCompleted.set(false);
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'completed' && this.completedOrders().length === 0) {
      this.loadCompletedOrders();
    }
    // التوجيه للتابة المخصصة للحرفي
    if (tab === 'artisan-completed' && this.artisanCompletedJobs().length === 0) {
      this.loadArtisanCompletedJobs();
    }
  }

  initForms(user: any) {
    this.profileForm = this.fb.group({
      full_name: [user.full_name || '', Validators.required],
      phone: [user.phone || '', Validators.required]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  getStatusLabel(status: string): string {
    const map: any = {
      pending: 'قيد الانتظار',
      accepted: 'جارٍ التنفيذ',
      completed: 'مكتمل',
      rejected: 'مرفوض'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: any = {
      pending: 'status-pending',
      accepted: 'status-accepted',
      completed: 'status-completed',
      rejected: 'status-rejected'
    };
    return map[status] || '';
  }

  getStars(count: number): number[] {
    return Array(Math.max(0, count || 0)).fill(0);
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        Swal.showLoading();
        await this.supabase.uploadAvatar(file);
        Swal.fire('تم!', 'تم تحديث صورتك الشخصية بنجاح', 'success');
      } catch (err) {
        Swal.fire('خطأ', 'حدثت مشكلة أثناء رفع الصورة', 'error');
      }
    }
  }

  async updateBasicInfo() {
    if (this.profileForm.invalid) return;
    this.loading.set(true);
    const { error } = await this.supabase.updateProfile(this.profileForm.value);
    this.loading.set(false);
    if (!error) {
      Swal.fire('تم التحديث', 'تم حفظ بياناتك بنجاح', 'success');
    } else {
      Swal.fire('خطأ', 'فشل في تحديث البيانات', 'error');
    }
  }

  async updateEmail(email: string) {
    if (!email || email === this.supabase.currentUser().email) {
      Swal.fire('تنبيه', 'يرجى إدخال بريد إلكتروني جديد ومختلف', 'warning');
      return;
    }
    this.loading.set(true);
    const { error } = await this.supabase.changeEmail(email);
    this.loading.set(false);
    if (error) {
      Swal.fire('خطأ', error.message, 'error');
    } else {
      Swal.fire({
        title: 'طلب تغيير البريد',
        text: 'تم إرسال روابط التأكيد للإيميل القديم والجديد. يرجى تفعيلهما.',
        icon: 'success'
      });
    }
  }

  async updatePassword() {
    if (this.passwordForm.invalid) return;
    this.loading.set(true);
    const { error } = await this.supabase.changePassword(this.passwordForm.get('password')?.value);
    this.loading.set(false);
    if (!error) {
      Swal.fire('تم بنجاح', 'تم تغيير كلمة المرور، استخدمها في دخولك القادم', 'success');
      this.passwordForm.reset();
    } else {
      Swal.fire('خطأ', error.message, 'error');
    }
  }

  handleLogout() {
    Swal.fire({
      title: 'تسجيل الخروج',
      text: 'هل تريد الخروج من الحساب？',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، اخرج',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#6366f1'
    }).then((result) => {
      if (result.isConfirmed) {
        this.supabase.signOut().subscribe(() => {
          this.router.navigate(['/Auth/Login']);
        });
      }
    });
  }

  async handleDeleteAccount() {
    const { isConfirmed } = await Swal.fire({
      title: 'حذف الحساب نهائياً؟',
      text: 'ستفقد كافة بياناتك، وستتم إزالة بريدك الإلكتروني من النظام فوراً ولا يمكن استعادته!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، احذف حسابي وإيميلي نهائياً',
      cancelButtonText: 'تراجع',
      customClass: { popup: 'swal-rtl' }
    });

    if (isConfirmed) {
      try {
        Swal.fire({
          title: 'جاري حذف الحساب...',
          text: 'برجاء الانتظار قليلاً',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        const user = this.supabase.currentUser();
        if (!user) throw new Error('لم يتم العثور على مستخدم مسجل حالياً');

        const { error } = await this.supabase.client
          .from('profiles')
          .delete()
          .eq('id', user.id);

        if (error) throw error;

        await this.supabase.client.auth.signOut();

        Swal.fire({
          title: 'تم الحذف!',
          text: 'تم مسح حسابك وإيميلك بالكامل من النظام.',
          icon: 'success',
          confirmButtonText: 'حسناً'
        }).then(() => {
          this.router.navigate(['/Auth/Register']);
        });

      } catch (err: any) {
        console.error('خطأ أثناء عملية الحذف بالكامل:', err);
        Swal.fire('خطأ في عملية الحذف', err.message || 'حدث خطأ غير متوقع.', 'error');
      }
    }
  }

  // ✅ شارات العميل القديمة (كما هي)
  initCharts() {
    if (this.categoryChartInstance) this.categoryChartInstance.destroy();
    if (this.timelineChartInstance) this.timelineChartInstance.destroy();

    const orders = this.allOrders();
    if (orders.length === 0) return;

    const categoriesMap: Record<string, number> = {};
    orders.forEach(order => {
      const name = order.profession_name || 'أخرى';
      categoriesMap[name] = (categoriesMap[name] || 0) + 1;
    });
    const categoryLabels = Object.keys(categoriesMap);
    const categoryData = Object.values(categoriesMap);

    const monthsMap: Record<string, number> = {};
    orders.forEach(order => {
      if (order.created_at) {
        const date = new Date(order.created_at);
        const monthYear = date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
        monthsMap[monthYear] = (monthsMap[monthYear] || 0) + 1;
      }
    });
    const timelineLabels = Object.keys(monthsMap).reverse();
    const timelineData = Object.values(monthsMap).reverse();

    if (this.categoryChartRef?.nativeElement) {
      this.categoryChartInstance = new Chart(this.categoryChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: categoryLabels,
          datasets: [{
            data: categoryData,
            backgroundColor: ['#3a3a5e', '#c9a84c', '#10b981', '#3b82f6', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#1e293b', font: { family: 'inherit' } } }
          }
        }
      });
    }

    if (this.timelineChartRef?.nativeElement) {
      this.timelineChartInstance = new Chart(this.timelineChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: timelineLabels,
          datasets: [{
            label: 'عدد الطلبات',
            data: timelineData,
            backgroundColor: '#3b82f6',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { ticks: { color: '#1e293b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { ticks: { color: '#1e293b' }, grid: { display: false } }
          }
        }
      });
    }
  }

  // ✅ دالة الشارتات الجديدة تماماً لمعالجة بيانات الحرفي كحرفي (مقدم خدمة)
  initArtisanCharts() {
    if (this.artisanCategoryChartInstance) this.artisanCategoryChartInstance.destroy();
    if (this.artisanTimelineChartInstance) this.artisanTimelineChartInstance.destroy();

    const jobs = this.allArtisanJobs();
    if (jobs.length === 0) return;

    // 1. حساب توزيع الحرف والأعمال المنفذة
    const categoriesMap: Record<string, number> = {};
    jobs.forEach(job => {
      const name = job.profession_name || 'خدمات عامة';
      categoriesMap[name] = (categoriesMap[name] || 0) + 1;
    });
    const categoryLabels = Object.keys(categoriesMap);
    const categoryData = Object.values(categoriesMap);

    // 2. توزيع الأعمال المنفذة على خط زمني بالشهور باللغة العربية
    const monthsMap: Record<string, number> = {};
    jobs.forEach(job => {
      if (job.created_at) {
        const date = new Date(job.created_at);
        const monthYear = date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
        monthsMap[monthYear] = (monthsMap[monthYear] || 0) + 1;
      }
    });
    const timelineLabels = Object.keys(monthsMap).reverse();
    const timelineData = Object.values(monthsMap).reverse();

    // بناء شارت الـ Doughnut للحرفي
    if (this.artisanCategoryChartRef?.nativeElement) {
      this.artisanCategoryChartInstance = new Chart(this.artisanCategoryChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: categoryLabels,
          datasets: [{
            data: categoryData,
            backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#14b8a6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#1e293b', font: { family: 'inherit' } } }
          }
        }
      });
    }

    // بناء شارت الـ Bar للحرفي
    if (this.artisanTimelineChartRef?.nativeElement) {
      this.artisanTimelineChartInstance = new Chart(this.artisanTimelineChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: timelineLabels,
          datasets: [{
            label: 'الأعمال المنجزة',
            data: timelineData,
            backgroundColor: '#10b981', // لون أخضر لتمييز إنتاجية الحرفي
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { ticks: { color: '#1e293b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { ticks: { color: '#1e293b' }, grid: { display: false } }
          }
        }
      });
    }
  }
}