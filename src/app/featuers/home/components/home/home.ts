import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnInit, PLATFORM_ID, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import gsap from 'gsap';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { Supabase } from '../../../../core/services/supabase/supabase';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  quote: string;
  image: string;
}

interface Service {
  id: number;
  slug: string;
  name_ar: string;
  icon_svg: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  @ViewChild('sliderTrack') sliderTrack!: ElementRef<HTMLElement>;
  
  private autoPlayInterval: any;
  services: Service[] = [];
  isLoadingServices: boolean = true;

  testimonials: Testimonial[] = [
    { id: 1, name: 'خالد الهاشمي', location: 'عميل من الدمام', quote: 'سهولة في الاستخدام وسرعة في الرد...', image: '/images/rateman1.webp' },
    { id: 2, name: 'سارة القحطاني', location: 'عميلة من جدة', quote: 'أفضل ما في نييرفيكس هو المصداقية...', image: '/images/rateman2.webp' },
    { id: 3, name: 'أحمد العتيبي', location: 'عميل من الرياض', quote: 'تجربة ممتازة جداً. طلبت كهربائي...', image: '/images/rateman3.webp' },
    { id: 4, name: 'مصطفي النعيمي', location: 'عميلة من مكة', quote: 'خدمة راقية وأسعار واضحة...', image: '/images/rateman4.webp' },
    { id: 5, name: 'محمد الدوسري', location: 'عميل من الخبر', quote: 'سرعة في الاستجابة وحل جذري...', image: '/images/rateman5.webp' }
  ];

  constructor(
    private supabase: Supabase, 
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFeaturedServices();
    } else {
      this.isLoadingServices = false;
    }
  }

  async loadFeaturedServices() {
    this.isLoadingServices = true;
    try {
      // 💡 تنبيه: اتأكد إن اسم السيرفس عندك 'client' مش حاجة تانية زي supabaseClient
      const supabaseInstance = (this.supabase as any).client || (this.supabase as any).supabaseClient;
      
      if (!supabaseInstance) {
        console.error('تنبيه: لم يتم العثور على كليانت Supabase في السيرفس، تأكد من الاسم المكتوب هناك.');
        this.getMockData(); // تشغيل بيانات وهمية مؤقتاً عشان الديزاين يظهر وميقفش
        return;
      }

      const { data, error } = await supabaseInstance
        .from('professions')
        .select('*')
        .order('id', { ascending: true })
        .limit(8);

      if (error) throw error;
 
      if (data && data.length > 0) {
        this.services = data;
      } else {
        this.getMockData(); // لو الجدول فاضي في الداتا بيز
      }
    } catch (error) {
      console.error('خطأ في جلب الخدمات المميزة، تم تشغيل البيانات الاحتياطية:', error);
      this.getMockData(); // لو السيرفر قطع، اعرض بيانات وهمية عشان الشاشة متقفلش
    } finally {
      this.isLoadingServices = false;
      this.cdr.detectChanges(); // إجبار أنجلر على تحديث الـ DOM فوراً

      // تشغيل أنيميشن الـ GSAP بأمان كامل بدون تدمير الـ Layout
      if (isPlatformBrowser(this.platformId) && this.services.length > 0) {
        setTimeout(() => {
          gsap.from('.services .grid .card', {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'all' // 💡 سطر سحري: يمسح تأثيرات GSAP بعد ما تخلص عشان متجبرش الكروت على مقاسات تبوظ الـ CSS
          });
        }, 50);
      }
    }
  }

  // دالة احتياطية عشان الديزاين يظهر لو النت فاصل أو الداتا بيز مش بترد
  getMockData() {
    this.services = [
      { id: 1, slug: 'plumbing', name_ar: 'سباكة', icon_svg: 'M12 2L2 22h20L12 2z', description: '' },
      { id: 2, slug: 'electricity', name_ar: 'كهرباء', icon_svg: 'M12 2L2 22h20L12 2z', description: '' },
      { id: 3, slug: 'carpentry', name_ar: 'نجارة', icon_svg: 'M12 2L2 22h20L12 2z', description: '' },
      { id: 4, slug: 'painting', name_ar: 'نقاشة', icon_svg: 'M12 2L2 22h20L12 2z', description: '' },
      { id: 5, slug: 'cleaning', name_ar: 'تنظيف', icon_svg: 'M12 2L2 22h20L12 2z', description: '' },
      { id: 6, slug: 'air-conditioning', name_ar: 'تكييفات', icon_svg: 'M12 2L2 22h20L12 2z', description: '' }
    ];
  }

  onServiceSelected(service: Service): void {
    this.supabase.getUser().subscribe({
      next: (res: any) => {
        if (res.data?.user) {
          this.router.navigate(['/OrderService', service.slug]);
        } else {
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

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.scrollNext();
    }, 1500); 
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  scrollNext() {
    if (!this.sliderTrack) return;
    const track = this.sliderTrack.nativeElement;
    const cardWidth = track.querySelector('.card')?.clientWidth || 0;
    const gap = 24; 
    
    if (track.scrollLeft - track.clientWidth <= -(track.scrollWidth - 10)) {
       track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
       track.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }
}