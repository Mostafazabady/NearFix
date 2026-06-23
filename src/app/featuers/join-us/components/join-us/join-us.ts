import { SwiperOptions } from './../../../../../../node_modules/swiper/types/swiper-options.d';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { register } from 'swiper/element/bundle';
import { RouterLink } from "@angular/router";
register();

export interface SuccessStory {
  name: string;
  profession: string;
  story: string;
  rating: number;
  image: string;
}



@Component({
  selector: 'app-join-us',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './join-us.html',
  styleUrl: './join-us.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class JoinUs implements OnInit {
  joinForm!: FormGroup;
  experienceLevels = ['مبتدئ', 'متوسط', 'خبير'];  
  stories: any[] = [];
  storyForm!: FormGroup;
  showModal = false;
  previewImage: string = '/images/avatarImage.webp';
  starsArray = [1, 2, 3, 4, 5]; // مصفوفة النجوم
    // رقم الواتساب الخاص بك (بالصيغة الدولية بدون أصفار أو +)
  whatsappNumber: string = '201065760158'; 

@ViewChild('swiperRef') swiperRef!: ElementRef; // مرجع للسلايدر في الـ HTML

config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: { nextEl: '.next-btn', prevEl: '.prev-btn' },
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  };




  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

 
  ngOnInit(): void {
    this.joinForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      city: ['', Validators.required],
      profession: ['', Validators.required],
      experience: ['متوسط', Validators.required],
      bio: ['', [Validators.required, Validators.minLength(20)]]
    });




    this.loadStories();
    this.initForm();


  }

  // helper للتحقق من صحة الحقول
  isInvalid(controlName: string): boolean {
    const control = this.joinForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.joinForm.valid) {
      console.log('بيانات الحرفي جاهزة للإرسال لـ Supabase:', this.joinForm.value);
      // هنا هيكون الربط مع الـ Service الخاص بالباك إيند
    } else {
      this.joinForm.markAllAsTouched();
    }
  }





initForm() {
    this.storyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      profession: ['', Validators.required],
      story: ['', [Validators.required, Validators.minLength(10)]],
      rating: [5, Validators.required], // القيمة الديفولت 5
      image: ['']
    });
  }


// دالة اختيار النجوم
  setRating(rating: number) {
    this.storyForm.patchValue({ rating: rating });
  }


  loadStories() {
    const saved = localStorage.getItem('user_stories');
    if (saved) {
      this.stories = JSON.parse(saved);
    } else {
      // بيانات افتراضية لو اللوكال استوريدج فاضي
      this.stories = [
        { name: 'خالد سليم', profession: 'نجار محترف', story: 'المنصة غيرت حياتي تماماً ووفرت لي دخل ثابت.', rating: 5, image: '/images/avatarImage.webp' },
        { name: 'أحمد كمال', profession: 'فني تكييف', story: 'سرعة في استلام الطلبات ودقة في المواعيد.', rating: 5, image: '/images/avatarImage.webp' }
      ];
    }
  }

  addStory() {
    if (this.storyForm.valid) {
      const newStory = {
        ...this.storyForm.value,
        image: this.storyForm.value.image || this.previewImage
      };

      // إضافة القصة الجديدة في أول القائمة
      this.stories = [newStory, ...this.stories];
      
      // حفظ في LocalStorage
      localStorage.setItem('user_stories', JSON.stringify(this.stories));

      this.closeModal();

      // أهم جزء: نطلب من Angular يحس بالتغيير ثم نطلب من Swiper يتحدث
      this.cdr.detectChanges(); 
      if (this.swiperRef) {
        this.swiperRef.nativeElement.swiper.update(); // تحديث السلايدر يدوياً
      }
    }
  }


// دالة مساعدة لعرض النجوم في الكروت (تكرار النجوم بناءً على الرقم)
  getStars(count: number) {
    return Array(count).fill(0);
  }




  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
        this.storyForm.patchValue({ image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; this.storyForm.reset({rating: 5}); this.previewImage = '/images/avatarImage.webp'; }








  faqs = [
    {
      question: 'كيف أستلم مستحقاتي المالية؟',
      answer: 'يمكنك استلام مبالغك المالية نقداً مباشرة من العميل بعد انتهاء العمل، أو عبر المحفظة الإلكترونية في التطبيق والتي يمكنك تحويلها لحسابك البنكي أسبوعياً.',
      isOpen: true // أول واحدة مفتوحة زي الصورة
    },
    {
      question: 'هل هناك رسوم للتسجيل في المنصة؟',
      answer: 'التسجيل في المنصة مجاني تماماً للحرفيين في الفترة الحالية لتشجيع العمالة الماهرة على الانضمام.',
      isOpen: false
    },
    {
      question: 'ما هي الأوراق المطلوبة لتوثيق الحساب؟',
      answer: 'نحتاج فقط إلى صورة البطاقة الشخصية، وفيش وتشبيه حديث، وصورة من شهادة القياس المهني إن وجدت.',
      isOpen: false
    },
    {
      question: 'هل يمكنني العمل بدوام جزئي فقط؟',
      answer: 'نعم، المنصة تمنحك كامل الحرية في اختيار أوقات العمل التي تناسبك وتحديد حالتك (متاح/غير متاح).',
      isOpen: false
    }
  ];

  toggleFaq(index: number) {
    // لو ضغطت على واحد مفتوح يقفله، ولو ضغطت على واحد مقفول يفتح ويقفل الباقي (Accordion Mode)
    this.faqs.forEach((item, i) => {
      if (i === index) {
        item.isOpen = !item.isOpen;
      } else {
        item.isOpen = false;
      }
    });
  }

  contactWhatsApp() {
    const message = encodeURIComponent('السلام عليكم، أحتاج للاستفسار عن الانضمام للمنصة كحرفي.');
    window.open(`https://wa.me/${this.whatsappNumber}?text=${message}`, '_blank');
  }








}
