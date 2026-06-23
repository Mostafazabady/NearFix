import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from "@angular/router";
import { Supabase } from '../../../services/supabase/supabase';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  isMenuOpen = false;
  isSettingsOpen = false;

  constructor(public supabase: Supabase, private router: Router) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.supabase.signOut().subscribe(() => {
      this.isSettingsOpen = false;
      this.closeMenu(); 
      this.router.navigate(['/home']);
    });
  }
}