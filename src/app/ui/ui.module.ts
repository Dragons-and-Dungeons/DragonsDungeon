import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
import { HomeComponent } from './home/home.component';
import { ErrorComponent } from './error/error.component';

// Routing
import { UIRoute } from "./ui.routes";
import { RouterModule} from "@angular/router";
import { AccountComponent } from './account/account.component';
import { ProfileComponent } from './profile/profile.component';
import { MapComponent } from './map/map.component';

@NgModule({
  declarations: [
    HomeComponent,
    ErrorComponent,
    AccountComponent,
    ProfileComponent,
    MapComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(UIRoute),
  ],
  exports:[
  ],
  providers:[],
})
export class UiModule { }
