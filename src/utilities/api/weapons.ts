import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, map, Observable, of, switchMap } from "rxjs";
import { ProjectClass } from "../classes/class";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class WeaponsClass{
    constructor(
      public http: HttpClient,
    ){}

    private getHttpHeaders(): HttpHeaders {
        return new HttpHeaders({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        });
    }

    public getCharactersLiteInformations(): Observable<Array<ProjectClass.Remote.WeaponListing>> {
      return this.http.get<Array<string>>(`${environment.apiUrl}/weapons`, { headers: this.getHttpHeaders(), observe: 'response' }).pipe(
        switchMap(response => {
          const names = response.body || [];
          if (names.length === 0) {
            return of([]);
          }

          const weaponRequests = names.map(name => {
            const generalInformationRequest = this.http.get(`${environment.apiUrl}/weapons/${name}`, {
              headers: this.getHttpHeaders(),
              observe: 'response'
            }).pipe(
              map(response => {
                const weapon = response.body as ProjectClass.Remote.Weapon;
                return {
                  rarity : weapon.rarity
                }
              })
            );
                    
            const iconRequest = this.http.get(`${environment.apiUrl}/weapons/${name}/icon`, {
              headers: this.getHttpHeaders(),
              observe: 'response',
              responseType: 'blob'
            }).pipe(
              map(iconResponse => iconResponse.body ? URL.createObjectURL(iconResponse.body) : '')
            );
              
            return forkJoin([generalInformationRequest, iconRequest]).pipe(
              map(([generalData, icon]) =>
                new ProjectClass.Remote.WeaponListing({ name, icon, rarity: generalData.rarity })
              )
            );
        });
        return forkJoin(weaponRequests)
      })
    )
  }
}