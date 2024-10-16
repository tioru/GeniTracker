import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ErrorHandlingService } from "../services/error-handling.service";

@Injectable({
    providedIn: 'root'
})
export class CharactersClass{
    constructor(
        public http: HttpClient,
        private errorHandlingService: ErrorHandlingService
    ){}
}