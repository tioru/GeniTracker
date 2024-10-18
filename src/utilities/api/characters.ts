import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ErrorHandlingService } from "../services/error-handling.service";
import { ProjectClass } from "../classes/class";
import { environment } from "../../environments/environment";
import { catchError, Observable, switchMap } from "rxjs";
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

    /*public getCharactersNameAndIcon() {
        
    }*/

    public getCharacter(characterName : string) : Observable<ProjectClass.Character | null> {
        return this.http.get(`${environment.apiUrl}/characters/${characterName}`, { headers: this.getHttpHeaders(), observe: 'response' }).pipe(
            switchMap(this.responseHandlingService.handleResponseTOrNull<ProjectClass.Character>("Récupération d'un personnage par nom")),
            catchError(this.errorHandlingService.handleError<ProjectClass.Character | null>("Récupération d'un personnage par nom", null))
          );
    }

    /*public getAllCharacters() : Array<ProjectClass.Character> {

    }*/
}