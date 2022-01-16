import { Component, OnInit } from '@angular/core';
import { ContractService } from "./../../services/contract/contract.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  direction: any | undefined;
  balance: string | undefined;
  profile: any;
  url: any;
  data: any;
  authenticated : boolean = false;

  constructor(
    private contract: ContractService) {
    this.contract
      .connectAccount()
      .then((value: any) => {
        this.direction = value[0];
        if (this.direction != undefined || null ){
          this.authenticated = true;
        } else {
          this.authenticated = false;
        }
        this.getDetails(this.direction);
        /* this.profile = this.threebox.getProfile(this.direction).then((response) => {
             console.log(response);
             this.profile = response;
             this.url = this.profile.image[0].contentUrl["/"];
           }); */
      })
      .catch((error: any) => {
        this.contract.failure(
          error, 'dismiss'
        );
      });
  }

  ngOnInit(): void {
  }

  navigateTo() {
    window.open("https://metamask.io/");
  }

  connectAccount() {
    this.contract
      .connectAccount()
      .then((value: any) => {
        console.log(value[0]);
        this.direction = value[0];
        this.getDetails(this.direction);
      })
      .catch((error: any) => {
        this.contract.failure(
          error, 'dismiss'
        );
      });
  }

  getDetails(account: any[]) {
    console.log(account)
    this.contract
      .accountInfo(account)
      .then((value: any) => {
        this.balance = value;
        console.log(this.balance)
      })
      .catch((error: any) => {
        this.contract.failure(
          error, 'dismiss'
        );
      });
  }

  test(){
  }




}
