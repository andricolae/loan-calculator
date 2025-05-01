import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { DialogComponent, DialogConfig } from '../dialog/dialog.component';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-dialog-container',
  imports: [CommonModule, DialogComponent],
  templateUrl: './dialog-container.component.html',
  styleUrl: './dialog-container.component.css'
})
export class DialogContainerComponent implements OnInit, OnDestroy {
  isDialogOpen = false;
  dialogConfig: DialogConfig = {
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    showCancel: true
  };

  private dialogSubscription!: Subscription;
  private currentResponseSubject?: Subject<boolean>;

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    this.dialogSubscription = this.dialogService.dialog$.subscribe(dialogData => {
      this.dialogConfig = dialogData.config;
      this.currentResponseSubject = dialogData.response;
      this.isDialogOpen = true;
    });
  }

  ngOnDestroy(): void {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }

  onConfirm(): void {
    if (this.currentResponseSubject) {
      this.currentResponseSubject.next(true);
      this.currentResponseSubject.complete();
    }
    this.isDialogOpen = false;
  }

  onCancel(): void {
    if (this.currentResponseSubject) {
      this.currentResponseSubject.next(false);
      this.currentResponseSubject.complete();
    }
    this.isDialogOpen = false;
  }

  onClose(): void {
    this.isDialogOpen = false;
  }
}
