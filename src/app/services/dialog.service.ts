import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DialogConfig } from '../components/shared/dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogSubject = new Subject<{ config: DialogConfig, response: Subject<boolean> }>();
  public dialog$ = this.dialogSubject.asObservable();

  constructor() {
  }

  confirm(config: DialogConfig): Observable<boolean> {

    const responseSubject = new Subject<boolean>();

    const finalConfig: DialogConfig = {
      title: config.title || 'Confirmation',
      message: config.message || 'Are you sure?',
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      showCancel: config.showCancel !== undefined ? config.showCancel : true,
      confirmClass: config.confirmClass,
      cancelClass: config.cancelClass
    };

    this.dialogSubject.next({
      config: finalConfig,
      response: responseSubject
    });

    return responseSubject.asObservable();
  }

  confirmAction(title: string, message: string): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      showCancel: true
    });
  }

  confirmDelete(itemName: string = 'item'): Observable<boolean> {
    return this.confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      confirmClass: 'bg-red-600 hover:bg-red-700 text-white'
    });
  }
}
