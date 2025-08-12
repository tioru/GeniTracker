import { Component } from '@angular/core';
import { API } from '../../utilities/api/request';
import { ProjectClass } from '../../utilities/classes/class';
import { NotificationService, notificationSeverity } from '../../utilities/services/notification.service';

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
    public notificationService : NotificationService
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

  public counter = 0
  
  public sendNotification1() : void {
    this.notificationService.addNotification({
      title: 'TEST',
      severity : notificationSeverity.ERROR,
      detail : "detail de test" + this.counter,
      sticky: true,
      delay: 3000
    })
    this.counter += 1
  }

  public sendNotification2() : void {
    this.notificationService.addNotification({
      title: 'TEST',
      severity : notificationSeverity.WARNING,
      detail : "detail de test" + this.counter,
      sticky: false,
      delay: 3000
    })
    this.counter += 1
  }

  public sendNotification3() : void {
    this.notificationService.addNotification({
      title: 'TEST',
      severity : notificationSeverity.INFO,
      detail : "detail de test" + this.counter,
      sticky: false,
      delay: 3000
    })
    this.counter += 1
  }

  public sendNotification4() : void {
    this.notificationService.addNotification({
      title: 'TEST',
      severity : notificationSeverity.OK,
      detail : "detail de test" + this.counter,
      sticky: false,
      delay: 3000
    })
    this.counter += 1
  }
}
