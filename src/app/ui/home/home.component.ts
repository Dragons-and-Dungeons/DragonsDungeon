import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Moralis } from 'moralis';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public isLoggedIn = false;
  public ethAddress: string | undefined;
  public username: string | undefined;
  public lastLogin: any;
  user: any;
  public showCharacterSheet: boolean = false;

  constructor(private cdr: ChangeDetectorRef){}

  ngOnInit() {
    Moralis.start({
      appId: environment.appId,
      serverUrl: environment.serverUrl,
    })
        .then(() => console.info('Moralis has been initialised.'))
        .finally(() => this.setLoggedInUser(Moralis.User.current()));
  }

  login(provider: 'metamask' | 'walletconnect' = 'metamask') {
    (provider === 'metamask'
        ? Moralis.Web3.authenticate()
        : Moralis.Web3.authenticate({ provider }))
        .then((loggedInUser) => this.setLoggedInUser(loggedInUser))
        .catch((e) => console.error(`Moralis '${provider}' login error:`, e));
  }

  logout() {
    Moralis.User.logOut()
        .then((loggedOutUser) => console.info('logout', loggedOutUser))
        // Set user to undefined
        .then(() => this.setLoggedInUser(undefined))
        // Disconnect Web3 wallet
        .then(() => Moralis.Web3.cleanup())
        .catch((e) => console.error('Moralis logout error:', e));
  }

  private async setLoggedInUser(loggedInUser?: any) {
    this.user = await loggedInUser;
    console.info(this.user);
    this.username = loggedInUser?.getUsername();
    this.ethAddress = loggedInUser?.attributes?.['ethAddress']
    this.lastLogin = loggedInUser?.updatedAt;
    if (loggedInUser == null || undefined) {
      this.showCharacterSheet = false;
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }
    this.cdr.detectChanges();
  }

  goToAdventure(){
    this.showCharacterSheet = true;
  }

}

