import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoanSimulation, LoanType } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-simulations',
  imports: [DatePipe, CurrencyPipe, CommonModule],
  templateUrl: './simulations.component.html',
  styleUrl: './simulations.component.css'
})
export class SimulationsComponent {
  simulations: LoanSimulation[] = [];

  constructor(private loanService: LoanService, private router: Router) {}

  ngOnInit(): void {
    this.loanService.getSimulations().subscribe(simulations => {
      this.simulations = simulations.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });
  }

  navigateToCalculator(): void {
    this.router.navigate(['/calculator']);
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

  deleteSimulation(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this simulation?')) {
      this.loanService.deleteSimulation(id);
    }
  }
}
