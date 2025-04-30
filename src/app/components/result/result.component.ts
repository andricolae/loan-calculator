import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoanSimulation, LoanType, PaymentFrequency } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';
@Component({
  selector: 'app-result',
  imports: [CommonModule, CurrencyPipe, DecimalPipe, DatePipe, RouterLink],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {
  simulation: LoanSimulation | undefined;

  LoanType = LoanType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.simulation = this.loanService.getSimulationById(id);
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
    if (this.simulation && confirm('Are you sure you want to delete this simulation?')) {
      this.loanService.deleteSimulation(this.simulation.id);
      this.router.navigate(['/simulations']);
    }
  }
}
