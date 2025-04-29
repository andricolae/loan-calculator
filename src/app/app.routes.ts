import { Routes } from '@angular/router';
import { HomeComponent } from '../app/components/shared/home/home.component';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { ResultComponent } from '../app/components/result/result.component';
import { SimulationsComponent } from './components/simulations/simulations.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'calculator', component: CalculatorComponent },
  { path: 'result/:id', component: ResultComponent },
  { path: 'simulations', component: SimulationsComponent },
  { path: '**', redirectTo: '' }
];
