import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToCalculator(): void {
    this.router.navigate(['/calculator']);
  }

  navigateToSimulations(): void {
    this.router.navigate(['/simulations']);
  }
}
