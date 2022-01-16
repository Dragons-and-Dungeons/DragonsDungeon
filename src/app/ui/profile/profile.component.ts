import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import { Moralis } from 'moralis';
import {environment} from "src/environments/environment";

export type User = Moralis.User<Moralis.Attributes>;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  @Input() user: any;


  constructor() {
    Moralis.start({
      appId: environment.appId,
      serverUrl: environment.serverUrl,
    })
        .then(() => console.info('Moralis has been initialised.'));
  }

  ngOnInit(): void {
    this.getNfts()

  }

  async getNfts(){
    console.log('here');
    const address = this.user?.attributes?.['ethAddress'];
    const options = { chain: 'matic', address: address };
    // @ts-ignore
    const polygonNFTs = await Moralis.Web3API.account.getNFTs(options);
    console.log(polygonNFTs);
  }

}
