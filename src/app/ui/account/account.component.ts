import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Moralis } from 'moralis';

export type User = Moralis.User<Moralis.Attributes>;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent implements OnInit {
  @Input() user: any;


  constructor() {
  }

  ngOnInit(): void {
  }

}
