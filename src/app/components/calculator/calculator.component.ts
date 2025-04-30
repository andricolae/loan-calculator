import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoanType, PaymentFrequency } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-calculator',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.css'
})
export class CalculatorComponent {
  calculatorForm: FormGroup;

  LoanType = LoanType;
  PaymentFrequency = PaymentFrequency;

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private router: Router
  ) {
    this.calculatorForm = this.fb.group({
      name: ['New Loan Simulation', Validators.required],
      type: [LoanType.SIMPLE, Validators.required],
      principal: [10000, [Validators.required, Validators.min(1)]],
      interestRate: [5, [Validators.required, Validators.min(0)]],
      term: [36, [Validators.required, Validators.min(1)]],
      paymentFrequency: [PaymentFrequency.MONTHLY, Validators.required],
      downPayment: [0, [Validators.min(0)]],
      balloonPayment: [0, [Validators.min(0)]],
      residualValue: [0, [Validators.min(0)]]
    });

    this.calculatorForm.get('type')?.valueChanges.subscribe(type => {
      if (type === LoanType.LEASING) {
        this.calculatorForm.get('residualValue')?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        this.calculatorForm.get('residualValue')?.setValidators([Validators.min(0)]);
      }
      this.calculatorForm.get('residualValue')?.updateValueAndValidity();
    });
  }

  calculateLoan(): void {
    if (this.calculatorForm.invalid) {
      Object.keys(this.calculatorForm.controls).forEach(field => {
        const control = this.calculatorForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      return;
    }

    const formValue = this.calculatorForm.value;

    const simulation = this.loanService.calculateLoan(
      formValue.principal,
      formValue.interestRate,
      formValue.term,
      formValue.paymentFrequency,
      formValue.type,
      formValue.downPayment,
      formValue.balloonPayment,
      formValue.residualValue
    );

    simulation.name = formValue.name;

    this.loanService.saveSimulation(simulation);

    this.router.navigate(['/result', simulation.id]);
  }
}
