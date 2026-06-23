import { CommonModule, isPlatformBrowser } from '@angular/common'; 
import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Supabase } from '../../../../../core/services/supabase/supabase';
import { SafePipe } from "./artisan-signup-pipe/safe-pipe";

@Component({
  selector: 'app-artisan-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SafePipe],
  templateUrl: './artisan-signup.html',
  styleUrl: './artisan-signup.scss',
})
export class ArtisanSignup implements OnInit {
  signupForm!: FormGroup;
  isLoading = signal(false); 
  
  // private map: any; 
  // private marker: any;

  selectedLat: number = 30.0444;
selectedLng: number = 31.2357;


  isMapOpen: boolean = false;

  selectedFiles: { [key: string]: File | null } = {
    profilePic: null, idFront: null, idBack: null, criminalRecord: null
  };

  professions = ['سباك', 'نجار', 'فني تكييف', 'دهانات', 'ميكانيكي', 'حدادة', 'كهرباء', 'تنسيق حدائق', 'نقل عفش', 'تنظيف منازل', 'غسيل سيارات', 'بناء'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabase: Supabase, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.signupForm = this.fb.group({
      personalInfo: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(10)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        phone: ['', [Validators.required, Validators.pattern('^01[0125][0-9]{8}$')]],
        profession: ['', Validators.required]
      }),
      experience: this.fb.group({
        locationDetails: ['', Validators.required],
        lat: [null, Validators.required],
        lng: [null, Validators.required],
        level: ['متوسط', Validators.required],
        bio: ['', [Validators.required, Validators.minLength(20)]]
      }) 
    });
  }

  // --- التعامل مع الملفات ---
  onFileChange(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiles[type] = file;
    }
  }

async uploadFile(userId: string, type: string, file: File | null): Promise<string | null> {
  if (!file) return null; // لو مفيش ملف متختارش، اخرج بسلام

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
  
  // حاول ترفع الملف
  const { data, error } = await this.supabase.client.storage
    .from('artisan-docs')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true // عشان لو الرفع اتكرر يمسح القديم ويحط الجديد
    });

  if (error) {
    console.error('Storage Upload Error:', error); // هيطبعلك في الكونسول السبب بالظبط
    throw new Error(`فشل رفع ملف ${type}: ${error.message}`);
  }

  const { data: urlData } = this.supabase.client.storage
    .from('artisan-docs')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

  // --- التسجيل الفعلي ---
  async onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      Swal.fire('تنبيه', 'يرجى إكمال البيانات واختيار الموقع على الخريطة', 'warning');
      return;
    }

    this.isLoading.set(true);
    const personal = this.signupForm.get('personalInfo')?.value;
    const exp = this.signupForm.get('experience')?.value;

    // 1. إنشاء الحساب في Auth
    this.supabase.signUp(personal.email, personal.password, personal.fullName, personal.phone, 'artisan').subscribe({
      next: async (res: any) => {
        if (res.error) {
          this.isLoading.set(false);
          Swal.fire('خطأ', res.error.message, 'error');
          return;
        }

        const userId = res.data.user.id;

        try {
          // 2. رفع الصور للـ Storage
          const profilePicUrl = await this.uploadFile(userId, 'profile', this.selectedFiles['profilePic']);
          const idFrontUrl = await this.uploadFile(userId, 'id_front', this.selectedFiles['idFront']);
          const idBackUrl = await this.uploadFile(userId, 'id_back', this.selectedFiles['idBack']);
          const criminalUrl = await this.uploadFile(userId, 'criminal', this.selectedFiles['criminalRecord']);

          // 3. حفظ البيانات في جدول الـ artisans المنفصل
          const { error: dbError } = await this.supabase.client
            .from('artisans')
            .insert([{
              id: userId,
              full_name: personal.fullName,
              phone: personal.phone,
              profession: personal.profession,
              bio: exp.bio,
              skill_level: exp.level,
              latitude: exp.lat,
              longitude: exp.lng,
              location_name: exp.locationDetails,
              profile_pic_url: profilePicUrl,
              id_front_url: idFrontUrl,
              id_back_url: idBackUrl,
              criminal_record_url: criminalUrl
            }]);

          this.isLoading.set(false);

          if (dbError) throw dbError;

          Swal.fire('نجاح', 'تم تسجيل بياناتك بنجاح، جاري مراجعة طلبك', 'success');
          this.router.navigate(['/Auth/PendingApproval']);

        } catch (err: any) {
          this.isLoading.set(false);
          Swal.fire('خطأ في البيانات', err.message, 'error');
        }
      },
      error: () => {
        this.isLoading.set(false);
        Swal.fire('خطأ', 'فشل في عملية التسجيل', 'error');
      }
    });
  }


  get iframeSrc(): string {
  return `https://www.openstreetmap.org/export/embed.html?bbox=${this.selectedLng - 0.01},${this.selectedLat - 0.01},${this.selectedLng + 0.01},${this.selectedLat + 0.01}&layer=mapnik&marker=${this.selectedLat},${this.selectedLng}`;
}

openMapModal() {
  if (isPlatformBrowser(this.platformId)) {
    this.isMapOpen = true;
  }
}

getCurrentLocation() {
  if (isPlatformBrowser(this.platformId) && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.selectedLat = position.coords.latitude;
        this.selectedLng = position.coords.longitude;

        this.signupForm.get('experience')?.patchValue({
          lat: this.selectedLat,
          lng: this.selectedLng,
          locationDetails: `إحداثيات: ${this.selectedLat.toFixed(4)}, ${this.selectedLng.toFixed(4)}`
        });
      },
      () => {
        Swal.fire('تنبيه', 'مش قادر يوصل لموقعك', 'warning');
      }
    );
  }
}

  closeMap() { this.isMapOpen = false; }
}