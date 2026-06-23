import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Supabase } from '../../../../../../core/services/supabase/supabase';




@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private supabase: Supabase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  // تهيئة الفورم مع التحقق من صحة البيانات
  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // دالة تسجيل الدخول
  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    this.supabase.signIn(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.error) {
          this.handleAuthError(response.error.message);
          return;
        }

        // نجاح الدخول - التوجه لصفحة الداشبورد أو الرئيسية
        console.log('Login Success:', response.data);
        this.router.navigate(['/home']); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'حدث خطأ في الاتصال بالسيرفر، حاول مرة أخرى.';
        console.error('Network Error:', err);
      }
    });
  }

  // معالجة أخطاء سوبابيز وترجمتها للعربية
  private handleAuthError(message: string): void {
    const msg = message.toLowerCase();
    if (msg.includes('invalid login credentials')) {
      this.errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    } else if (msg.includes('email not confirmed')) {
      this.errorMessage = 'يرجى تأكيد بريدك الإلكتروني أولاً.';
    } else {
      this.errorMessage = 'فشل تسجيل الدخول، تأكد من بياناتك وحاول ثانية.';
    }
  }

  // Getter للوصول السهل للحقول من الـ HTML
  get f() {
    return this.loginForm.controls;
  }



  async onGoogleRegister() {
    try {
      await this.supabase.loginWithGoogle();
    } catch (error) {
      console.error(error);
    }
  }


}