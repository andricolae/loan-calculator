import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoanService } from '../../services/loan.service';
import { DialogService } from '../../services/dialog.service';
import { NotificationService } from '../../services/notification.service';
import { LoanSimulation, LoanType, PaymentFrequency } from '../../models/loan.model';

@Component({
  selector: 'app-simulations',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './simulations.component.html',
  styleUrl: './simulations.component.css'
})
export class SimulationsComponent implements OnInit, OnDestroy {
  simulations: LoanSimulation[] = [];
  private subscription: Subscription | null = null;

  constructor(
    private loanService: LoanService,
    private router: Router,
    private dialogService: DialogService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.subscription = this.loanService.getSimulations().subscribe(
      simulations => {
        this.simulations = [...simulations].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getLoanTypeName(type: LoanType): string {
    switch (type) {
      case LoanType.SIMPLE:
        return 'Simple Loan';
      case LoanType.COMPOUND:
        return 'Compound Loan';
      case LoanType.LEASING:
        return 'Leasing';
      default:
        return 'Unknown';
    }
  }

  getPaymentFrequencyName(frequency: PaymentFrequency): string {
    switch (frequency) {
      case PaymentFrequency.MONTHLY:
        return 'Monthly';
      case PaymentFrequency.WEEKLY:
        return 'Weekly';
      default:
        return 'Unknown';
    }
  }

  viewSimulation(id: string): void {
    this.router.navigate(['/result', id]);
  }

  deleteSimulation(simulation: LoanSimulation, event: Event): void {
    event.stopPropagation();

    this.dialogService.confirm({
      title: 'Delete Simulation',
      message: `Are you sure you want to delete "${simulation.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      confirmClass: 'bg-red-600 hover:bg-red-700 text-white'
    }).subscribe({
      next: (confirmed) => {
        if (confirmed) {
          this.loanService.deleteSimulation(simulation.id);
          this.notificationService.success(`"${simulation.name}" deleted successfully`);
        }
      }
    });
  }

  createNewSimulation(): void {
    this.router.navigate(['/calculator']);
  }

  getFormattedAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
}
