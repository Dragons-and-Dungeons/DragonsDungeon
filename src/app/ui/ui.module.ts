import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { HomeComponent } from './home/home.component';
import { ErrorComponent } from './error/error.component';

// Routing
import { UIRoute } from "./ui.routes";
import { RouterModule} from "@angular/router";
import { AccountComponent } from './account/account.component';

@NgModule({
  declarations: [
    HomeComponent,
    ErrorComponent,
    AccountComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(UIRoute),
  ],
  exports:[
  ],
  providers:[],
})
export class UiModule { }
