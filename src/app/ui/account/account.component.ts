import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Moralis } from 'moralis';
import {environment} from "src/environments/environment";

export type User = Moralis.User<Moralis.Attributes>;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent implements OnInit {
  @Input() user: any;
  CharacterForm: FormGroup | undefined;

  constructor(private fb: FormBuilder) {
    Moralis.start({
      appId: environment.appId,
      serverUrl: environment.serverUrl,
    })
        .then(() => console.info('Moralis has been initialised.'));
  }

  ngOnInit(): void {
    this.createForm();
    this.getNfts()

  }

  createForm(){
    this.CharacterForm = this.fb.group({
      name: ['', Validators.required],
      class: ['', Validators.required],
      race: ['', Validators.required],
      bio: ['', Validators.required],
    });
  }

  async getNfts(){
    console.log('here');
    const address = this.user?.attributes?.['ethAddress'];
    const options = { chain: 'matic', address: address };
    // @ts-ignore
    const polygonNFTs = await Moralis.Web3API.account.getNFTs(options);
    console.log(polygonNFTs);
  }


  createCharacter(){
    const character = {
      name: this.CharacterForm?.value.name,
      class: this.CharacterForm?.value.class,
      race: this.CharacterForm?.value.race,
      bio: this.CharacterForm?.value.bio,
    }
    console.log(character)
    const Character = Moralis.Object.extend("Character");
    const Newcharacter = new Character();

    Newcharacter.set("name", character.name);
    Newcharacter.set("class", character.class);
    Newcharacter.set("race", character.race);
    Newcharacter.set("bio", character.bio);

    Newcharacter.save().then((Newcharacter:any) => {
      // Execute any logic that should take place after the object is saved.
      alert('New object created with objectId: ' + Newcharacter.id);
    }, (error:any) => {
      // Execute any logic that should take place if the save fails.
      // error is a Moralis.Error with an error code and message.
      alert('Failed to create new object, with error code: ' + error.message);
    });

  }

}
