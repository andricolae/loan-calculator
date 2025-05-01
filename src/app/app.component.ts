import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../app/components/shared/nav/nav.component';
import { NotificationContainerComponent } from './components/shared/notification-container/notification-container.component';
import { DialogContainerComponent } from './components/shared/dialog-container/dialog-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, NotificationContainerComponent, DialogContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Loan Calculator';

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
