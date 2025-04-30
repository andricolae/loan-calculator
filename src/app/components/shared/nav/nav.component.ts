import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  isMenuOpen = false;

  constructor() {}

  ngOnInit(): void {}

  toggleMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMenuOpen = false;
  }
}
