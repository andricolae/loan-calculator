import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent, Notification } from '../notification/notification.component';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-container',
  imports: [CommonModule, NotificationComponent],
  templateUrl: './notification-container.component.html',
  styleUrl: './notification-container.component.css'
})
export class NotificationContainerComponent {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  onCloseNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
}
