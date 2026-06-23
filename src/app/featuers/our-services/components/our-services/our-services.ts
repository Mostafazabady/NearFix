import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Supabase } from '../../../../core/services/supabase/supabase';

// واجهة بيانات الخدمة مطابقة لجدول قاعدة البيانات
interface Service {
  id: number;
  slug: string;
  name_ar: string;
  icon_svg: string;
  description: string;
}

@Component({
  selector: 'app-our-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './our-services.html',
  styleUrl: './our-services.scss',
})
export class OurServices implements OnInit, OnDestroy {
  // المصفوفات فاضية في البداية لحد ما الداتا تيجي
  allServices: Service[] = [];
  filteredServices: Service[] = [];
  
  // حالة التحميل
  isLoading: boolean = true;
  
  // إعدادات الـ Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;

  // إعدادات البحث
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(private supabase: Supabase, private router: Router, private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    // 1. جلب البيانات من السيرفر
    this.loadServicesFromDB();

    // 2. تطبيق لوجيك الـ RxJS على حقل البحث
    this.searchControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(400),
      distinctUntilChanged(),
      map(term => (term || '').toLowerCase().trim())
    ).subscribe(searchTerm => {
      this.filterServices(searchTerm);
    });
  }

  // دالة جلب البيانات من Supabase
  async loadServicesFromDB() {
    this.isLoading = true;
    try {
      // بنفترض إن كلاس الـ Supabase عندك بيتيح الوصول للـ client بالشكل ده
      // لو كان اسمه مختلف عندك (مثلاً this.supabase.client) عدلها
      const { data, error } = await this.supabase.client
        .from('professions')
        .select('*')
        .order('id', { ascending: true }); // لترتيبهم زي ما دخلناهم

      if (error) throw error;
 
      if (data) {
        this.allServices = data;
        this.filteredServices = [...this.allServices];
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('خطأ في جلب الخدمات:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // دالة البحث
  filterServices(term: string): void {
    this.currentPage = 1; 
    
    if (!term) {
      this.filteredServices = [...this.allServices];
      return;
    }

    this.filteredServices = this.allServices.filter(service => 
      service.name_ar.includes(term) || service.slug.toLowerCase().includes(term)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // الدالة اللي هتتنفذ لما اليوزر يدوس على كارت الخدمة
  onServiceSelected(service: Service): void {
    this.supabase.getUser().subscribe({
      next: (res: any) => {
        if (res.data?.user) {
          // ✅ اليوزر مسجل دخول
          console.log('مرحباً بك، جاري توجيهك لطلب خدمة:', service.name_ar);
          // استخدمنا المسار الصحيح اللي اتفقنا عليه
          this.router.navigate(['/OrderService', service.slug]);
        } else {
          // ❌ اليوزر مش مسجل
          console.log('عفواً، يجب تسجيل الدخول أولاً');
          this.router.navigate(['/Auth/Register'], { 
            queryParams: { returnUrl: `/OrderService/${service.slug}` } 
          });
        }
      },
      error: (err: any) => {
        console.error('خطأ في التحقق من المستخدم:', err);
      } 
    });
  }
}