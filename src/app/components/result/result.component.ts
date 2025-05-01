import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoanSimulation, LoanType, PaymentFrequency } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';
import { DialogService } from '../../services/dialog.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-result',
  imports: [CommonModule, CurrencyPipe, DecimalPipe, DatePipe, RouterLink],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent implements OnInit {
  simulation: LoanSimulation | undefined;

  LoanType = LoanType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService,
    private dialogService: DialogService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.simulation = this.loanService.getSimulationById(id);

        if (!this.simulation) {
          this.notificationService.error('The simulation was not found or has been deleted.');
        }
      }
    });
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

  getPaymentLabel(): string {
    if (!this.simulation) return 'Payment';

    switch (this.simulation.paymentFrequency) {
      case PaymentFrequency.MONTHLY:
        return 'Monthly Payment';
      case PaymentFrequency.WEEKLY:
        return 'Weekly Payment';
      default:
        return 'Payment';
    }
  }

  navigateToCalculator(): void {
    this.router.navigate(['/calculator']);
  }

  deleteSimulation(): void {
    if (!this.simulation) return;

    this.dialogService.confirm({
      title: 'Delete Simulation',
      message: `Are you sure you want to delete the simulation "${this.simulation.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      confirmClass: 'bg-red-600 hover:bg-red-700 text-white'
    }).subscribe({
      next: (confirmed) => {
        if (confirmed) {
          this.loanService.deleteSimulation(this.simulation!.id);
          this.notificationService.success('Simulation deleted successfully');
          this.router.navigate(['/simulations']);
        }
      },
      error: (err) => {
        console.error('Dialog error:', err);
        this.notificationService.error('An error occurred during confirmation');
      }
    });
  }
}
