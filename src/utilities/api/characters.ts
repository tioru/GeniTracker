import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ProjectClass } from "../classes/class";
import { environment } from "../../environments/environment";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
@Injectable({
    providedIn: 'root'
})
export class CharactersClass{
  constructor(
    public http: HttpClient,
  ){}

  private getHttpHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });
  }

  public getCharactersLiteInformations(): Observable<Array<ProjectClass.Remote.CharacterListing>> {
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
            map((response) => {
              const character = response.body as ProjectClass.Remote.Character
              return { 
                vision: character.vision,
                release: character.release
              };
            })
          );
    
          const iconRequest = this.http.get(`${environment.apiUrl}/characters/${name}/icon-big`, {
            headers: this.getHttpHeaders(),
            observe: 'response',
            responseType: 'blob'
          }).pipe(
            map(iconResponse => iconResponse.body ? URL.createObjectURL(iconResponse.body) : '')
          );
    
          return forkJoin([generalInformationRequest, iconRequest]).pipe(
            map(([generalData, icon]) =>
              new ProjectClass.Remote.CharacterListing({ name, icon, vision: generalData.vision, release: generalData.release })
            )
          );
        });
        return forkJoin(characterRequests);
      }),
    );
  }

  public getCharacterArts(characterName: string): Observable<ProjectClass.Remote.CharacterArts> {
    const artRequests = ProjectClass.Remote.CharacterArtsArray.map((artType) => {
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
        const characterArts = new ProjectClass.Remote.CharacterArts;

        arts.forEach(art => {
          characterArts[art.type] = art.url;
        });

        return characterArts;
      })
    );
  }    
    

  public getCharacterInformations(characterName : string) : Observable<ProjectClass.Remote.Character> {
    return this.http.get(`${environment.apiUrl}/characters/${characterName}`, { headers: this.getHttpHeaders(), observe: 'response'
    }).pipe(
      map(response => response.body ? new ProjectClass.Remote.Character(response.body) : new ProjectClass.Remote.Character())
    );
  }
}
