import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanSimulation, LoanType, PaymentFrequency } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-result',
  imports: [CommonModule, CurrencyPipe, DecimalPipe, DatePipe, ReactiveFormsModule, FormsModule],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent implements OnInit {
  simulation: LoanSimulation | undefined;
  previewSimulation: LoanSimulation | undefined;
  isEditing = false;
  editForm: FormGroup;

  LoanType = LoanType;
  PaymentFrequency = PaymentFrequency;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      type: [LoanType.SIMPLE, Validators.required],
      principal: [0, [Validators.required, Validators.min(1)]],
      interestRate: [0, [Validators.required, Validators.min(0)]],
      term: [0, [Validators.required, Validators.min(1)]],
      paymentFrequency: [PaymentFrequency.MONTHLY, Validators.required],
      downPayment: [0, [Validators.min(0)]],
      balloonPayment: [0, [Validators.min(0)]],
      residualValue: [0, [Validators.min(0)]]
    });

    this.editForm.get('type')?.valueChanges.subscribe(type => {
      if (type === LoanType.LEASING) {
        this.editForm.get('residualValue')?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        this.editForm.get('residualValue')?.setValidators([Validators.min(0)]);
      }
      this.editForm.get('residualValue')?.updateValueAndValidity();

      this.updatePreview();
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const loadedSimulation = this.loanService.getSimulationById(id);
        if (loadedSimulation) {
          this.simulation = loadedSimulation;
          console.log('Loaded simulation:', this.simulation);

          this.editForm.setValue({
            name: this.simulation.name,
            type: this.simulation.type,
            principal: this.simulation.principal,
            interestRate: this.simulation.interestRate,
            term: this.simulation.term,
            paymentFrequency: this.simulation.paymentFrequency,
            downPayment: this.simulation.downPayment || 0,
            balloonPayment: this.simulation.balloonPayment || 0,
            residualValue: this.simulation.residualValue || 0
          });
        }
      }
    });
  }

  toggleEditing(): void {
    this.isEditing = true;

    this.previewSimulation = undefined;

    if (this.simulation) {
      console.log('Setting form values for editing:', this.simulation);
      this.editForm.setValue({
        name: this.simulation.name,
        type: this.simulation.type,
        principal: this.simulation.principal,
        interestRate: this.simulation.interestRate,
        term: this.simulation.term,
        paymentFrequency: this.simulation.paymentFrequency,
        downPayment: this.simulation.downPayment || 0,
        balloonPayment: this.simulation.balloonPayment || 0,
        residualValue: this.simulation.residualValue || 0
      });
    }
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.previewSimulation = undefined;
  }

  updatePreview(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      console.log('Updating preview with form values:', formValue);

      try {
        const updatedSimulation = this.loanService.calculateLoan(
          formValue.principal,
          formValue.interestRate,
          formValue.term,
          formValue.paymentFrequency,
          formValue.type,
          formValue.downPayment,
          formValue.balloonPayment,
          formValue.residualValue
        );

        updatedSimulation.id = this.simulation!.id;
        updatedSimulation.name = formValue.name;
        updatedSimulation.createdAt = this.simulation!.createdAt;

        this.previewSimulation = updatedSimulation;
        console.log('Preview updated:', this.previewSimulation);
      } catch (error) {
        console.error('Error updating simulation preview:', error);
      }
    }
  }

  saveChanges(): void {
    if (this.editForm.valid && this.previewSimulation) {
      console.log('Saving changes:', this.previewSimulation);
      this.loanService.saveSimulation(this.previewSimulation);

      this.simulation = this.previewSimulation;
      this.previewSimulation = undefined;
      this.isEditing = false;
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

  getPaymentLabel(): string {
    const currentSimulation = this.previewSimulation || this.simulation;
    if (!currentSimulation) return 'Payment';

    switch (currentSimulation.paymentFrequency) {
      case PaymentFrequency.MONTHLY:
        return 'Monthly Payment';
      case PaymentFrequency.WEEKLY:
        return 'Weekly Payment';
      default:
        return 'Payment';
    }
  }

  deleteSimulation(): void {
    if (this.simulation && confirm('Are you sure you want to delete this simulation?')) {
      this.loanService.deleteSimulation(this.simulation.id);
      this.router.navigate(['/simulations']);
    }
  }

  navigateToCalculator(): void {
    this.router.navigate(['/calculator']);
  }
}
