import { Routes } from '@angular/router';

// Components
import {AccountComponent} from "./account/account.component";
import {HomeComponent} from "./home/home.component";
import {ErrorComponent} from "./error/error.component";

export const UIRoute: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'account', component: AccountComponent},
  { path: 'home', component: HomeComponent},
  { path: '404', component: ErrorComponent },
  { path: '**', redirectTo: '/404' },
];
