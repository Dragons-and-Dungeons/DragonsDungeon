import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Moralis } from 'moralis';
import {environment} from "src/environments/environment";


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  CharacterForm: FormGroup | undefined;
  userData: any
  showMyProfile: boolean = true;
  nftsList: any[] = [] ;

  constructor(private fb: FormBuilder) {
    Moralis.start({
      appId: environment.appId,
      serverUrl: environment.serverUrl,
    }).then(() => console.info('Moralis started.'));

    Moralis.User.currentAsync().then((user) => {
      this.userData = user 
      // do stuff with your user
    });
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(){
    this.CharacterForm = this.fb.group({
      name: ['', Validators.required],
      class: ['', Validators.required],
      race: ['', Validators.required],
      bio: ['', Validators.required],
    });
  }

  async getNfts(id: string){
    const address = this.userData?.attributes?.['ethAddress'];
    const options = { chain: id, address: address };
    // @ts-ignore
    const polygonNFTs = await Moralis.Web3API.account.getNFTs(options);
    console.log(polygonNFTs);

    this.nftsList = polygonNFTs.result;
  }


  createCharacter(){
    const character = {
      name: this.CharacterForm?.value.name,
      ownerAddress: this.userData?.attributes?.['ethAddress'],
      class: this.CharacterForm?.value.class,
      race: this.CharacterForm?.value.race,
      bio: this.CharacterForm?.value.bio,
    }
    const Character = Moralis.Object.extend("Character");
    const Newcharacter = new Character();

    Newcharacter.set("name", character.name);
    Newcharacter.set("ownerAddress", character.ownerAddress);
    Newcharacter.set("class", character.class);
    Newcharacter.set("race", character.race);
    Newcharacter.set("bio", character.bio);

    Newcharacter.save().then((Newcharacter:any) => {
      // Execute any logic that should take place after the object is saved.
      alert('New object created with objectId: ' + Newcharacter.id);
      this.showMyProfile = false;
    }, (error:any) => {
      // Execute any logic that should take place if the save fails.
      // error is a Moralis.Error with an error code and message.
      alert('Failed to create new object, with error code: ' + error.message);
    });

  }

}
