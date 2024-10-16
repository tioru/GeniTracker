import { Injectable } from "@angular/core";
import { CharactersClass } from "./characters";

export namespace API {
    @Injectable({
        providedIn: 'root'
    })
    export class Characters extends CharactersClass{}
}

export const APIProvider = [
    API.Characters
]