import { Injectable } from "@angular/core";
import { CharactersClass } from "./characters";
import { WeaponsClass } from "./weapons";

export namespace API {
    @Injectable({
        providedIn: 'root'
    })
    export class Characters extends CharactersClass{}

    @Injectable({
        providedIn: 'root'
    })
    export class Weapons extends WeaponsClass{}
}

export const APIProvider = [
    API.Characters,
    API.Weapons
]