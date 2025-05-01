import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoanType, PaymentFrequency } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { NotificationType } from '../shared/notification/notification.component';

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
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.calculatorForm = this.fb.group({
      name: ['New Loan Simulation', Validators.required],
      type: [LoanType.SIMPLE, Validators.required],
      principal: [10000, [Validators.required, Validators.min(1)]],
      interestRate: [5, [Validators.required, Validators.min(0.1)]],
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

    this.calculatorForm.valueChanges.subscribe(() => {
      this.validateFormValues();
    });
  }

  validateFormValues(): void {
    const form = this.calculatorForm;
    const principal = form.get('principal')?.value;
    const downPayment = form.get('downPayment')?.value;
    const interestRate = form.get('interestRate')?.value;
    const balloonPayment = form.get('balloonPayment')?.value;
    const term = form.get('term')?.value;

    form.get('downPayment')?.setErrors(null);

    if (downPayment < 0) {
      form.get('downPayment')?.setErrors({ isNegative: true });
      this.notificationService.error('Down payment cannot be lower than zero');
    }

    if ( balloonPayment < 0) {
      form.get('balloonPayment')?.setErrors({ isNegative: true });
      this.notificationService.error('Balloon payment cannot be lower than zero');
    }

    if (downPayment > principal) {
      form.get('downPayment')?.setErrors({ exceedsPrincipal: true });
      this.notificationService.error('Down payment cannot exceed the principal amount');
    }

    if (interestRate > 30) {
      this.notificationService.warning('Interest rate is unusually high. Please double-check this value.');
    }

    if (term > 360) {
      this.notificationService.warning('Loan term is unusually long. Please double-check this value.');
    }
  }

  calculateLoan(): void {
    if (this.calculatorForm.invalid) {
      Object.keys(this.calculatorForm.controls).forEach(field => {
        const control = this.calculatorForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });

      this.notificationService.error('Please fix the validation errors before submitting.');
      return;
    }

    try {
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

      this.notificationService.success('Loan calculation completed successfully!');
      this.router.navigate(['/result', simulation.id]);
    } catch (error) {
      console.error('Error calculating loan:', error);
      this.notificationService.error('An error occurred while calculating the loan. Please try again.');
    }
  }
}
