import { CommonModule } from '@angular/common';
import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CountUpDirective } from '../../Directive/count-up-directive';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-who-us',
  imports: [CommonModule, CountUpDirective, RouterLink],
  templateUrl: './who-us.html',
  styleUrl: './who-us.scss',
})
export class WhoUs {
  x = 0;
  y = 0;
mouseX = 0;
  mouseY = 0;

  @ViewChild('ctaCard') ctaCard!: ElementRef;


  @ViewChild('magneticBadge') badge!: ElementRef;

  @ViewChild('parallaxBox') parallaxBox!: ElementRef;

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    // حساب نسب الدوران (بحد أقصى 15 درجة)
    const rotateX = ((clientY / innerHeight) - 0.5) * -15;
    const rotateY = ((clientX / innerWidth) - 0.5) * 15;

    if (this.parallaxBox) {
      this.parallaxBox.nativeElement.style.transform = 
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
    
    // لإرسال إحداثيات الماوس للزرار (اختياري للـ Blob effect)
    this.x = clientX;
    this.y = clientY;
  }





handleHover(e: MouseEvent) {
  const badgeEl = this.badge.nativeElement;
  const rect = badgeEl.getBoundingClientRect();
  
  // حساب المسافة بين الماوس ومركز الكارت
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const distanceX = e.clientX - centerX;
  const distanceY = e.clientY - centerY;

  // لو الماوس قريب من الكارت، خليه يتحرك معاه بنسبة بسيطة
  if (Math.abs(distanceX) < 150 && Math.abs(distanceY) < 150) {
    badgeEl.style.transform = `translate(${distanceX * 0.2}px, ${distanceY * 0.2}px)`;
  } else {
    badgeEl.style.transform = `translate(0, 0)`;
  }
}





handleSpotlight(e: MouseEvent, card: HTMLElement) {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  card.style.setProperty('--x', `${x}px`);
  card.style.setProperty('--y', `${y}px`);
}






onMouseMove_2(e: MouseEvent) {
    const rect = this.ctaCard.nativeElement.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;

    // تأثير الـ Tilt (ميلان الكارت)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (this.mouseY - centerY) / 30;
    const rotateY = (this.mouseX - centerX) / -30;

    this.ctaCard.nativeElement.style.transform = 
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  // تأثير الزرار المغناطيسي
  magneticButton(e: MouseEvent) {
    const btn = e.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
  }




}



