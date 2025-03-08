import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ErrorHandlingService } from "../services/error-handling.service";
import { ProjectClass } from "../classes/class";
import { environment } from "../../environments/environment";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
import { ResponseHandlingService } from "../services/response-handling.service";

const CARD = "card"
const CONSTELLATION = "constellation"
const CONSTELLATION_1 = "constellation-1"
const CONSTELLATION_2 = "constellation-2"
const CONSTELLATION_3 = "constellation-3"
const CONSTELLATION_4 = "constellation-4"
const CONSTELLATION_5 = "constellation-5"
const CONSTELLATION_6 = "constellation-6"
const CONSTELLATION_SHAPE = "constellation-shape"
const GACHA_CARD = "gacha-card"
const GACHA_SPLASH = "gacha-splash"
const ICON = "icon"
const ICON_BIG = "icon-big"
const ICON_SIDE = "icon-side"
const NAMECARD_BACKGROUND = "namecard-background"
const PORTAIT = "portrait"
const TALENT_BURST = "talent-burst"
const TALENT_NA = "talent-na"
const TALENT_PASSIVE_0 = "talent-passive-0"
const TALENT_PASSIVE_1 = "talent-passive-1"
const TALENT_PASSIVE_2 = "talent-passive-2"
const TALENT_SKILL = "talent-skill"

const CHARACTERS_ART_IMG_REQUEST = [CARD, CONSTELLATION, CONSTELLATION_1, CONSTELLATION_2, CONSTELLATION_3, CONSTELLATION_4, CONSTELLATION_5, CONSTELLATION_6, CONSTELLATION_SHAPE, GACHA_CARD, GACHA_SPLASH, ICON, ICON_BIG, ICON_SIDE, NAMECARD_BACKGROUND, PORTAIT, TALENT_BURST, TALENT_NA, TALENT_PASSIVE_0, TALENT_PASSIVE_1, TALENT_PASSIVE_2, TALENT_SKILL]

@Injectable({
    providedIn: 'root'
})
export class CharactersClass{
    constructor(
        public http: HttpClient,
        private errorHandlingService: ErrorHandlingService,
        private responseHandlingService : ResponseHandlingService
    ){}

    private getHttpHeaders(): HttpHeaders {
        return new HttpHeaders({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        });
    }

    public getCharactersLiteInformations(): Observable<Array<ProjectClass.CharacterListing>> {
      return this.http.get<Array<string>>(`${environment.apiUrl}/characters`, { headers: this.getHttpHeaders(), observe: 'response' }).pipe(
        switchMap(response => {
          const names = response.body || [];
          if (names.length === 0) {
            return of([]);
          }
    
          const characterRequests = names.map(name => {
            const generalInformationRequest = this.http.get(`${environment.apiUrl}/characters/${name}`, {
              headers: this.getHttpHeaders(),
              observe: 'response'
            }).pipe(
              map(response => ({ 
                vision: (response.body as any as ProjectClass.Character).vision,
                release: (response.body as any as ProjectClass.Character).release
              }))
            );
    
            const iconRequest = this.http.get(`${environment.apiUrl}/characters/${name}/icon-big`, {
              headers: this.getHttpHeaders(),
              observe: 'response',
              responseType: 'blob'
            }).pipe(
              map(iconResponse => iconResponse.body ? URL.createObjectURL(iconResponse.body) : 'default-icon.png')
            );
    
            return forkJoin([generalInformationRequest, iconRequest]).pipe(
              map(([generalData, icon]) =>
                new ProjectClass.CharacterListing({ name, icon, vision: generalData.vision, release: generalData.release })
              )
            );
          });
    
          return forkJoin(characterRequests);
        }),
        catchError(this.errorHandlingService.handleError<Array<ProjectClass.CharacterListing>>('Récupération des noms et icônes des personnages', []))
      );
    }

    public getCharacterArts(characterName: string): Observable<ProjectClass.CharacterArts> {
      const characterArts = new ProjectClass.CharacterArts();

      const artRequests = CHARACTERS_ART_IMG_REQUEST.map(artType => {
        return this.http.get(`${environment.apiUrl}/characters/${characterName}/${artType}`, {
          headers: this.getHttpHeaders(),
          observe: 'response',
          responseType: 'blob'
        }).pipe(
          map(response => ({
            type: artType,
            url: response.body ? URL.createObjectURL(response.body) : null
          })),
          catchError(() => of({ type: artType, url: null }))
        );
      });
      
      return forkJoin(artRequests).pipe(
        map(arts => {
          arts.forEach(art => {
            characterArts[art.type] = art.url;
          });
          return characterArts;
        })
      );
    }    
    

    public getCharacterInformations(characterName : string) : Observable<ProjectClass.Character> {
      return this.http.get(`${environment.apiUrl}/characters/${characterName}`, { headers: this.getHttpHeaders(), observe: 'response'
      }).pipe(
        map(response => response.body ? new ProjectClass.Character(response.body) : new ProjectClass.Character())
      );
    }
}
