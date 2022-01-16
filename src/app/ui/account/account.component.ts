import { Component, OnInit } from '@angular/core';
import { ContractService } from "./../../services/contract/contract.service";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {


  constructor(private contract: ContractService) { }

  ngOnInit(): void {

  }




}
