import { Component } from '@angular/core';
import { Navbar } from "../../core/components/navbar/navbar/navbar";
import { RouterOutlet } from "@angular/router";
import { Footer } from "../../core/components/footer/footer/footer";

@Component({
  selector: 'app-navbar-layout',
  imports: [Navbar, RouterOutlet, Footer],
  templateUrl: './navbar-layout.html',
  styleUrl: './navbar-layout.scss',
})
export class NavbarLayout {}
