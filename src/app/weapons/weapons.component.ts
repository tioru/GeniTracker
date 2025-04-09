import { Component } from '@angular/core';
import { API } from '../../utilities/api/request';
import { ProjectClass } from '../../utilities/classes/class';

@Component({
  selector: 'app-weapons',
  standalone: true,
  imports: [],
  templateUrl: './weapons.component.html',
  styleUrl: './weapons.component.scss'
})
export class WeaponsComponent {
  public weaponsCard : {hover : boolean, weapon : ProjectClass.Local.WeaponListing}[] = [];
  public loadingWeapons : boolean = true;

  constructor(
    public weaponsService : API.Weapons,
    //public weaponListingMapper : WeaponListingMapper
  ) {}

  ngOnInit(): void {
    this.weaponsService.getCharactersLiteInformations().subscribe((weapons : ProjectClass.Remote.WeaponListing[]) => {
      weapons.forEach((weapon : ProjectClass.Remote.WeaponListing) => {
        console.log(weapon)
        //this.weaponsCard.push({hover: false, weapon: this.weaponListingMapper.mapRemote(weapon)})
      })
      this.loadingWeapons = false;
    })
  }
}
