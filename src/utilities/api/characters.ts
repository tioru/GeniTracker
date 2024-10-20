import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ErrorHandlingService } from "../services/error-handling.service";
import { ProjectClass } from "../classes/class";
import { environment } from "../../environments/environment";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
import { ResponseHandlingService } from "../services/response-handling.service";

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

    public getCharactersNameAndIcon(): Observable<Array<ProjectClass.CharacterListing>> {
        return this.http.get<Array<string>>(`${environment.apiUrl}/characters`, { headers: this.getHttpHeaders(), observe: 'response' }).pipe(
          switchMap(response => {
            const names = response.body || [];
            if (names.length === 0) {
              return of([]);
            }
      
            const iconRequests = names.map(name =>
              this.http.get(`${environment.apiUrl}/characters/${name}/icon-big`, {
                headers: this.getHttpHeaders(),
                observe: 'response',
                responseType: 'blob' // Spécifie que la réponse est un Blob
              }).pipe(
                map(iconResponse => {
                  if (iconResponse.body) {
                    // Crée l'URL si body n'est pas null
                    const imageUrl = URL.createObjectURL(iconResponse.body);
                    return new ProjectClass.CharacterListing({ name, icon: imageUrl });
                  } else {
                    // Si body est null, on retourne une icône par défaut
                    return new ProjectClass.CharacterListing({ name, icon: 'default-icon.png' });
                  }
                }),
                catchError(error => {
                  console.error(`Erreur lors de la récupération de l'icône pour le personnage ${name}:`, error);
                  return of(new ProjectClass.CharacterListing({ name, icon: 'default-icon.png' }));
                })
              )
            );
      
            return forkJoin(iconRequests);
          }),
          catchError(this.errorHandlingService.handleError<Array<ProjectClass.CharacterListing>>('Récupération des noms et icônes des personnages', []))
        );
    }
      
      
      

    public getCharacter(characterName : string) : Observable<ProjectClass.Character | null> {
        return this.http.get(`${environment.apiUrl}/characters/${characterName}`, { headers: this.getHttpHeaders(), observe: 'response' }).pipe(
            switchMap(this.responseHandlingService.handleResponseTOrNull<ProjectClass.Character>("Récupération d'un personnage par nom")),
            catchError(this.errorHandlingService.handleError<ProjectClass.Character | null>("Récupération d'un personnage par nom", null))
          );
    }

    /*public getAllCharacters() : Array<ProjectClass.Character> {

    }*/
}