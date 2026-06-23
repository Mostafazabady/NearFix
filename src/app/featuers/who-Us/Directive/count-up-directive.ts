import { isPlatformBrowser } from '@angular/common';
import { Directive, Input, ElementRef, OnInit, Renderer2, signal, Inject, PLATFORM_ID } from '@angular/core';

@Directive({
  selector: '[countUp]',
  standalone: true
})
export class CountUpDirective implements OnInit {
  @Input('countUp') endVal: number = 0;
  @Input() duration: number = 2000; // مدة الأنميشن بالـ ms

  constructor(@Inject(PLATFORM_ID) private platformId: any, private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
// ✅ 2. حوط كود الأنيميشن أو الـ window بشرط الـ Browser
    if (isPlatformBrowser(this.platformId)) {
      
      // ⬇️ انقل كود الـ animateCount أو استدعاء الـ window القديم بتاعك هنا ⬇️
      this.animateCount(); 
      
    }  }

  private animateCount() {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / this.duration, 1);
      
      // حساب القيمة الحالية بناءً على الوقت المنقضي
      const currentVal = Math.floor(progress * this.endVal);
      
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', currentVal.toLocaleString());

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
}