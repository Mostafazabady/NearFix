import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pending-approval',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './pending-approval.html',
  styleUrl: './pending-approval.scss',
})
export class PendingApproval {
  isLoading = signal(false);

  constructor(private router: Router) {}

  goHome() {
    this.isLoading.set(true);

    setTimeout(() => {
      this.router.navigate(['/home']);
      this.isLoading.set(false);
    }, 2000);
  }

  openWhatsApp() {
    const phone = '201065760158';
    const message = encodeURIComponent('مرحبا، أحتاج مساعدة');
    const isMobile = /iPhone|Android/i.test(navigator.userAgent);
    const url = isMobile ? `https://wa.me/${phone}?text=${message}` : `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;
    window.open(url, '_blank');
  }
}