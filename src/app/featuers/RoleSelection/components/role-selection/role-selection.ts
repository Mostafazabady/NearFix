import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './role-selection.html',
  styleUrls: ['./role-selection.scss']
})
export class RoleSelection {

  @ViewChildren('card') cards!: QueryList<ElementRef>;

  constructor(private router: Router) {}

  // =================== Mouse Move ===================
  handleMove(event: MouseEvent, index: number) {
    const cardEl = this.cards.toArray()[index]?.nativeElement;
    if (!cardEl) return;

    const rect    = cardEl.getBoundingClientRect();
    const x       = event.clientX - rect.left;
    const y       = event.clientY - rect.top;
    const centerX = rect.width  / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) *  6;

    cardEl.style.transition = 'transform 0.1s ease';
    cardEl.style.transform  =
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  }

  // =================== Mouse Leave ===================
  handleLeave(index: number) {
    const cardEl = this.cards.toArray()[index]?.nativeElement;
    if (!cardEl) return;

    cardEl.style.transition = 'transform 0.5s ease';
    cardEl.style.transform  =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  }

  // =================== Navigate ===================
  navigateTo(role: 'craftsman' | 'client') {
    if (role === 'craftsman') {
      this.router.navigate(['/Auth/artisan-signup']);
    } else {
      this.router.navigate(['/Auth/Register']);
    }
  }
}