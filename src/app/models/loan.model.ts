export interface LoanSimulation {
  id: string;
  name: string;
  createdAt: Date;

  principal: number;
  interestRate: number;
  term: number;
  paymentFrequency: PaymentFrequency;
  type: LoanType;

  downPayment?: number;
  balloonPayment?: number;
  residualValue?: number;

  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationSchedule: AmortizationEntry[];
}

export enum PaymentFrequency {
  MONTHLY = 'monthly',
  WEEKLY = 'weekly'
}

export enum LoanType {
  SIMPLE = 'simple',
  COMPOUND = 'compound',
  LEASING = 'leasing'
}

export interface AmortizationEntry {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}
