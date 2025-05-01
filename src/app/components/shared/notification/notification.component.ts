import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateX(20px)'
      })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ])
  ]
})

export class NotificationComponent implements OnInit, OnDestroy {
  @Input() notification!: Notification;
  @Output() close = new EventEmitter<string>();

  private autoCloseTimeout: any;

  NotificationType = NotificationType;

  ngOnInit(): void {
    if (this.notification.autoClose !== false) {
      const duration = this.notification.duration || 5000;
      this.autoCloseTimeout = setTimeout(() => {
        this.closeNotification();
      }, duration);
    }
  }

  ngOnDestroy(): void {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }
  }

  closeNotification(): void {
    this.close.emit(this.notification.id);
  }

  getBackgroundColor(): string {
    switch (this.notification.type) {
      case NotificationType.SUCCESS:
        return 'bg-green-100 border-green-500 text-green-800';
      case NotificationType.ERROR:
        return 'bg-red-100 border-red-500 text-red-800';
      case NotificationType.WARNING:
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case NotificationType.INFO:
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  }

  getIconColor(): string {
    switch (this.notification.type) {
      case NotificationType.SUCCESS:
        return 'text-green-500';
      case NotificationType.ERROR:
        return 'text-red-500';
      case NotificationType.WARNING:
        return 'text-yellow-500';
      case NotificationType.INFO:
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }
}
