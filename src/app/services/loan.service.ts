import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AmortizationEntry, LoanSimulation, LoanType, PaymentFrequency } from '../models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private readonly STORAGE_KEY = 'loan_simulations';
  private simulationsSubject = new BehaviorSubject<LoanSimulation[]>([]);
  public simulations$ = this.simulationsSubject.asObservable();

  constructor() {
    this.loadSimulationsFromStorage();
  }

  private loadSimulationsFromStorage(): void {
    try {
      const storedSimulations = localStorage.getItem(this.STORAGE_KEY);
      if (storedSimulations) {
        const parsedSimulations = JSON.parse(storedSimulations) as LoanSimulation[];

        const simulations = parsedSimulations.map(sim => ({
          ...sim,
          createdAt: new Date(sim.createdAt)
        }));

        this.simulationsSubject.next(simulations);
      }
    } catch (error) {
      console.error('Error loading simulations from localStorage:', error);
      this.simulationsSubject.next([]);
    }
  }

  private saveSimulationsToStorage(simulations: LoanSimulation[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(simulations));
    } catch (error) {
      console.error('Error saving simulations to localStorage:', error);
    }
  }

  getSimulations(): Observable<LoanSimulation[]> {
    return this.simulations$;
  }

  getSimulationById(id: string): LoanSimulation | undefined {
    return this.simulationsSubject.value.find(sim => sim.id === id);
  }

  saveSimulation(simulation: LoanSimulation): void {
    const currentSimulations = this.simulationsSubject.value;
    const existingIndex = currentSimulations.findIndex(sim => sim.id === simulation.id);

    let updatedSimulations: LoanSimulation[];

    if (existingIndex >= 0) {
      updatedSimulations = [
        ...currentSimulations.slice(0, existingIndex),
        simulation,
        ...currentSimulations.slice(existingIndex + 1)
      ];
    } else {
      updatedSimulations = [...currentSimulations, simulation];
    }

    this.simulationsSubject.next(updatedSimulations);
    this.saveSimulationsToStorage(updatedSimulations);
  }

  deleteSimulation(id: string): void {
    const currentSimulations = this.simulationsSubject.value;
    const updatedSimulations = currentSimulations.filter(sim => sim.id !== id);

    this.simulationsSubject.next(updatedSimulations);
    this.saveSimulationsToStorage(updatedSimulations);
  }

  calculateLoan(
    principal: number,
    interestRate: number,
    term: number,
    paymentFrequency: PaymentFrequency,
    type: LoanType,
    downPayment: number = 0,
    balloonPayment: number = 0,
    residualValue: number = 0
  ): LoanSimulation {
    const adjustedPrincipal = principal - downPayment;

    let monthlyPayment = 0;
    let totalPayment = 0;
    let totalInterest = 0;
    let amortizationSchedule: AmortizationEntry[] = [];

    const monthlyInterestRate = interestRate / 100 / 12;

    switch (type) {
      case LoanType.SIMPLE:
        monthlyPayment = this.calculateSimpleLoanPayment(
          adjustedPrincipal,
          monthlyInterestRate,
          term
        );

        amortizationSchedule = this.generateAmortizationSchedule(
          adjustedPrincipal,
          monthlyInterestRate,
          term,
          monthlyPayment
        );
        break;

      case LoanType.COMPOUND:
        monthlyPayment = this.calculateCompoundLoanPayment(
          adjustedPrincipal,
          monthlyInterestRate,
          term
        );

        amortizationSchedule = this.generateAmortizationSchedule(
          adjustedPrincipal,
          monthlyInterestRate,
          term,
          monthlyPayment
        );
        break;

      case LoanType.LEASING:
        monthlyPayment = this.calculateLeasingPayment(
          adjustedPrincipal,
          monthlyInterestRate,
          term,
          residualValue
        );

        amortizationSchedule = this.generateLeasingSchedule(
          adjustedPrincipal,
          monthlyInterestRate,
          term,
          monthlyPayment,
          residualValue
        );
        break;
    }

    if (paymentFrequency !== PaymentFrequency.MONTHLY) {
      monthlyPayment = this.adjustForPaymentFrequency(
        monthlyPayment,
        paymentFrequency
      );
    }

    totalPayment = (monthlyPayment * term) + downPayment + balloonPayment;
    totalInterest = totalPayment - principal + residualValue;

    const simulation: LoanSimulation = {
      id: this.generateId(),
      name: `${type} Loan - $${principal}`,
      createdAt: new Date(),
      principal,
      interestRate,
      term,
      paymentFrequency,
      type,
      downPayment,
      balloonPayment,
      residualValue,
      monthlyPayment,
      totalPayment,
      totalInterest,
      amortizationSchedule
    };

    return simulation;
  }

  private calculateSimpleLoanPayment(principal: number, monthlyInterestRate: number, term: number): number {
    return principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, term)) /
            (Math.pow(1 + monthlyInterestRate, term) - 1);
  }

  private calculateCompoundLoanPayment(principal: number, monthlyInterestRate: number, term: number): number {
    return this.calculateSimpleLoanPayment(principal, monthlyInterestRate, term);
  }

  private calculateLeasingPayment(principal: number, monthlyInterestRate: number, term: number, residualValue: number): number {
    const presentValueOfResidual = residualValue / Math.pow(1 + monthlyInterestRate, term);
    return (principal - presentValueOfResidual) *
           (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, term)) /
            (Math.pow(1 + monthlyInterestRate, term) - 1);
  }

  private adjustForPaymentFrequency(monthlyPayment: number, frequency: PaymentFrequency): number {
    switch (frequency) {
      case PaymentFrequency.WEEKLY:
        return (monthlyPayment * 12) / 52;
      default:
        return monthlyPayment;
    }
  }

  private generateAmortizationSchedule(
    principal: number,
    monthlyInterestRate: number,
    term: number,
    monthlyPayment: number
  ): AmortizationEntry[] {
    const schedule: AmortizationEntry[] = [];
    let balance = principal;

    for (let period = 1; period <= term; period++) {
      const interestPayment = balance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        period,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });

      if (balance <= 0) break;
    }

    return schedule;
  }

  private generateLeasingSchedule(
    principal: number,
    monthlyInterestRate: number,
    term: number,
    monthlyPayment: number,
    residualValue: number
  ): AmortizationEntry[] {
    const schedule: AmortizationEntry[] = [];
    let balance = principal;

    for (let period = 1; period <= term; period++) {
      const interestPayment = balance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      if (period === term) {
        schedule.push({
          period,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: residualValue
        });
      } else {
        schedule.push({
          period,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance)
        });
      }

      if (period < term && balance <= 0) break;
    }

    return schedule;
  }

  private generateId(): string {
    return 'sim-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  }
}
