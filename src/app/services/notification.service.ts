import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification, NotificationType } from '../components/shared/notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  addNotification(notification: Partial<Notification>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      id,
      type: notification.type || NotificationType.INFO,
      message: notification.message || '',
      autoClose: notification.autoClose !== undefined ? notification.autoClose : true,
      duration: notification.duration || 5000
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    return id;
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      currentNotifications.filter(notification => notification.id !== id)
    );
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  success(message: string, options?: Partial<Notification>): string {
    return this.addNotification({
      message,
      type: NotificationType.SUCCESS,
      ...options
    });
  }

  error(message: string, options?: Partial<Notification>): string {
    return this.addNotification({
      message,
      type: NotificationType.ERROR,
      ...options
    });
  }

  warning(message: string, options?: Partial<Notification>): string {
    return this.addNotification({
      message,
      type: NotificationType.WARNING,
      ...options
    });
  }

  info(message: string, options?: Partial<Notification>): string {
    return this.addNotification({
      message,
      type: NotificationType.INFO,
      ...options
    });
  }

  private generateId(): string {
    return 'notification-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  }
}
