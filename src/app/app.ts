import { Component,signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from "./core/components/navbar/navbar/navbar";
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [RouterOutlet]
})
export class App {
  protected readonly title = signal('mashro3');
  

}
