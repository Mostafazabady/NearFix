import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators
} from '@angular/forms';
import { Supabase } from '../../core/services/supabase/supabase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-artisan-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-artisan-profile.html',
  styleUrl: './update-artisan-profile.scss'
})
export class UpdateArtisanProfile implements OnInit {
  professions = ['سباك', 'نجار', 'فني تكييف', 'دهانات', 'ميكانيكي', 'حدادة', 'كهرباء', 'تنسيق حدائق', 'نقل عفش', 'تنظيف منازل', 'غسيل سيارات', 'بناء'];
  profileForm!:     FormGroup;
  isLoading      = signal(true);
  isSaving       = signal(false);
  isUploading    = signal(false);
  isUploadingAvatar = signal(false);

  // ✅ Signals لعرض المهارات والصور بشكل فوري وثابت
  skills          = signal<string[]>([]);
  portfolioImages = signal<string[]>([]);

  constructor(private fb: FormBuilder, public supabase: Supabase) {}

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.profileForm = this.fb.group({
      full_name:     ['', Validators.required],
      profession:    ['', Validators.required],
      phone:         ['', Validators.required],
      bio:           [''],
      response_time: ['30-60 دقيقة'],
      skillInput:    [''], 
      schedule:      this.fb.array([])
    });
  }

  get scheduleArray(): FormArray {
    return this.profileForm.get('schedule') as FormArray;
  }

  // ✅ تحميل البيانات وجلبها بكل الطرق الممكنة لمنع الـ Reset عند الريلود
  async loadData() {
    this.isLoading.set(true);
    const user = this.supabase.currentUser();
    if (!user) { 
      this.isLoading.set(false); 
      return; 
    }

    try {
      const { data, error } = await this.supabase.getArtisanFullProfile(user.id);
      if (error) throw error;
      
      if (data) {
        // تأمين قراءة البيانات سواء كانت في المستوى الأول أو داخل الـ details
        const baseData = data;
        const detailsData = data.artisan_details || data;

        // 1. ملء الحقول النصية الأساسية في الـ Form
        this.profileForm.patchValue({
          full_name:     baseData.full_name || baseData.fullName || '',
          profession:    baseData.profession || '',
          phone:         baseData.phone || '',
          bio:           detailsData.bio || '',
          response_time: detailsData.response_time || detailsData.responseTime || '30-60 دقيقة'
        });

        // 2. تعبئة الـ Signals وتثبيتها حتى لا تختفي
        if (detailsData.skills && Array.isArray(detailsData.skills)) {
          this.skills.set(detailsData.skills);
        } else if (baseData.skills && Array.isArray(baseData.skills)) {
          this.skills.set(baseData.skills);
        }

        if (detailsData.portfolio_images && Array.isArray(detailsData.portfolio_images)) {
          this.portfolioImages.set(detailsData.portfolio_images);
        } else if (baseData.portfolio_images && Array.isArray(baseData.portfolio_images)) {
          this.portfolioImages.set(baseData.portfolio_images);
        }

        // 3. تنظيف وبناء الـ FormArray للمواعيد بشكل سليم وموثوق
        this.scheduleArray.clear();
        const savedSchedule = detailsData.schedule || baseData.schedule;
        
        if (savedSchedule && Array.isArray(savedSchedule) && savedSchedule.length > 0) {
          savedSchedule.forEach((s: any) => {
            this.scheduleArray.push(this.fb.group({
              day:   [s.day || '', Validators.required],
              hours: [s.hours || '', Validators.required]
            }));
          });
        } else {
          this.addScheduleRow(); // إضافة صف افتراضي في حال عدم وجود مواعيد سابقة
        }
      }
    } catch (e) { 
      console.error('Error loading artisan data:', e); 
    } finally { 
      this.isLoading.set(false); 
    }
  }

  // ━━━━━━━━━━━━━ مواعيد العمل ━━━━━━━━━━━━━
  addScheduleRow() {
    this.scheduleArray.push(this.fb.group({
      day:   ['', Validators.required],
      hours: ['09:00 ص – 05:00 م', Validators.required]
    }));
  }

  removeScheduleRow(i: number) {
    if (this.scheduleArray.length > 1) {
      this.scheduleArray.removeAt(i);
    }
  }

  // ━━━━━━━━━━━━━ المهارات ━━━━━━━━━━━━━
  addSkill(event: Event) {
    event.preventDefault();
    const val = this.profileForm.get('skillInput')?.value?.trim();
    if (val && !this.skills().includes(val)) {
      this.skills.update(prev => [...prev, val]);
      this.profileForm.get('skillInput')?.reset();
    }
  }

  removeSkill(skill: string) {
    this.skills.update(prev => prev.filter(s => s !== skill));
  }

  // ━━━━━━━━━━━━━ الصورة الشخصية ━━━━━━━━━━━━━
  async onAvatarUpload(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.isUploadingAvatar.set(true);
    try {
      await this.supabase.uploadAvatar(file);
      Swal.fire('تم!', 'تم تحديث الصورة الشخصية بنجاح', 'success');
      await this.loadData(); // إعادة تحميل جلب الصورة الجديدة فوراً وثباتها
    } catch (err) { 
      Swal.fire('خطأ', 'فشل رفع الصورة الشخصية', 'error'); 
    } finally { 
      this.isUploadingAvatar.set(false); 
    }
  }

  // ━━━━━━━━━━━━━ معرض الأعمال ━━━━━━━━━━━━━
  async onPortfolioUpload(event: any) {
    const files = event.target.files as FileList;
    if (!files?.length) return;
    this.isUploading.set(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await this.supabase.uploadPortfolioImage(files[i]);
        uploadedUrls.push(url);
      }
      
      // تحديث فوري للـ Signal بناء على القيم القديمة والجديدة معا
      this.portfolioImages.update(prev => [...prev, ...uploadedUrls]);
      
      // حفظ فوري ومباشر في قاعدة البيانات لضمان عدم الضياع عند عمل ريلود
      await this.supabase.upsertArtisanDetails({ 
        portfolio_images: this.portfolioImages(),
        skills: this.skills()
      });
      
      Swal.fire('تم!', `تم رفع ${files.length} صورة بنجاح وضمان حفظهم`, 'success');
    } catch (err) { 
      Swal.fire('خطأ', 'فشل رفع الصور في المعرض', 'error'); 
    } finally { 
      this.isUploading.set(false); 
    }
  }

  async removeImage(index: number) {
    const { isConfirmed } = await Swal.fire({
      title: 'حذف الصورة؟',
      icon: 'warning',
      showCancelButton:  true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText:  'إلغاء',
      confirmButtonColor: '#ef4444'
    });
    if (!isConfirmed) return;

    this.portfolioImages.update(prev => prev.filter((_, i) => i !== index));
    
    // مزامنة فورية للحذف في قاعدة البيانات لحماية البيانات من التراجع عند الـ Reload
    await this.supabase.upsertArtisanDetails({ 
      portfolio_images: this.portfolioImages(),
      skills: this.skills()
    });
  }

  // ━━━━━━━━━━━━━ حفظ جميع البيانات بشكل أبدي ━━━━━━━━━━━━━
  async saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      Swal.fire('تنبيه', 'يرجى ملء الحقول المطلوبة بالشكل الصحيح', 'warning');
      return;
    }
    this.isSaving.set(true);

    try {
      const v = this.profileForm.value;
      const currentUserId = this.supabase.currentUser()?.id;

      if (!currentUserId) throw new Error('لم يتم العثور على هوية مستخدم صالحة');

      // 1. تحديث الجدول الأساسي profiles
      const { error: e1 } = await this.supabase.updateBasicProfile({
        full_name:  v.full_name,
        phone:      v.phone,
        profession: v.profession
      });
      if (e1) throw e1;

      // 2. تحديث جدول التفاصيل الإضافية والـ Arrays لضمان حفظ المهارات والصور والمواعيد
      const { error: e2 } = await this.supabase.upsertArtisanDetails({
        bio:              v.bio,           
        skills:           this.skills(),
        response_time:    v.response_time, 
        schedule:         v.schedule,
        portfolio_images: this.portfolioImages()
      });
      if (e2) throw e2;

      // 3. مزامنة البيانات وتأكيد التحديث لجدول الـ artisans الرئيسي لمنع التعارض
      await this.supabase.client
        .from('artisans')
        .update({ 
          full_name: v.full_name, 
          phone: v.phone, 
          profession: v.profession,
          bio: v.bio,
          skill_level: v.response_time // أو أي حقل مخصص لربطه
        })
        .eq('id', currentUserId);

      Swal.fire('تم الحفظ!', 'تم مزامنة وحفظ جميع تعديلات بروفايلك بنجاح ولم تضيع بعد اليوم ✓', 'success');
      
      // إعادة تحميل للبيانات للتأكد التام من استقرار الـ State من الـ DB مباشرة
      await this.loadData();
    } catch (err: any) {
      console.error('Error during saving profile:', err);
      Swal.fire('خطأ', err?.message || 'فشل تحديث ومزامنة البيانات في قاعدة البيانات', 'error');
    } finally {
      this.isSaving.set(false);
    }
  }

  // ✅ جلب آمن للصورة الشخصية الحالية لمنع الـ Break عند الـ Refresh
  getCurrentAvatar(): string {
    const user = this.supabase.currentUser();
    return user?.avatar_url || user?.user_metadata?.avatar_url || '/images/avatarImage.png';
  }
}