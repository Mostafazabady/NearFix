import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Supabase } from '../../../../../core/services/supabase/supabase';
import Swal from 'sweetalert2'; // استيراد سويت أليرت

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  signupForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private supabase: Supabase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', Validators.required]
}, { validators: this.passwordMatchValidator }); // هنا يتم التحقق من التطابق
  }


  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  get f() { return this.signupForm.controls; }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { email, password, fullName, phone } = this.signupForm.value;
    const role = 'client';

    this.supabase.signUp(email, password, fullName, phone, role).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        
        if (response.error) {
          const errMsg = response.error.message.toLowerCase();
          let alertText = 'حصلت مشكلة أثناء التسجيل، حاول تاني.';

          // فحص نوع الخطأ لعرض رسالة مخصصة باللغة العربية
          if (errMsg.includes('already registered') || errMsg.includes('unique constraint') || errMsg.includes('profiles_email_key')) {
            alertText = 'البريد الإلكتروني ده مسجل قبل كده بالفعل! ❌';
          } else if (errMsg.includes('weak')) {
            alertText = 'كلمة السر ضعيفة جداً، اختار كلمة أقوى.';
          } else if (errMsg.includes('phone') || errMsg.includes('phone_egyptian_format')) {
            alertText = 'رقم الهاتف ده مسجل قبل كده أو صيغته مش مظبوطة.';
          } else {
            alertText = response.error.message;
          }

          // بوب أب الخطأ
          Swal.fire({
            title: 'خطأ في التسجيل!',
            text: alertText,
            icon: 'error',
            confirmButtonText: 'موافق',
            confirmButtonColor: '#dc2626'
          });
          return;
        }

        // بوب أب النجاح
        Swal.fire({
          title: 'تم التسجيل بنجاح! 🎉',
          text: 'حسابك جاهز دلوقتي. شيك على إيميلك لو محتاج تفعيل، وجاري تحويلك لصفحة تسجيل الدخول...',
          icon: 'success',
          confirmButtonText: 'ممتاز',
          confirmButtonColor: '#16a34a',
          timer: 3000,
          timerProgressBar: true
        }).then(() => {
          this.router.navigate(['/Auth/Login']);
        });
      },
      error: () => {
        this.isLoading.set(false);
        Swal.fire({
          title: 'خطأ في الاتصال!',
          text: 'مشكلة في الاتصال بالإنترنت أو السيرفر، اتأكد من الشبكة وحاول تاني.',
          icon: 'error',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#dc2626'
        });
      }
    });
  }




  async onGoogleRegister() {
    try {
      await this.supabase.loginWithGoogle();
    } catch (error) {
      console.error(error);
    }
  }


}