import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { envirionment } from '../environments/environment.development';
import { catchError, Observable } from 'rxjs';
import { PokemonResponse, PokemonResultType } from '../types/pokemonType';

@Injectable({
  providedIn: 'root',
})
export class Api {
  constructor(private http: HttpClient) {}

  getPokemons(): Observable<PokemonResponse> {
    return this.http.get<PokemonResponse>(`${envirionment.pokemonUrl}`).pipe(
      catchError((error) => {
        if (error.status === 401) {
          console.error('Not authorized');
        } else if (error.status === 404) {
          console.error('Pokémon not found');
        }

        switch (error.status) {
          case 401:
            console.error('Not authorized');
            break;
          case 404:
            console.error('Pokémon not found');
            break;
          case 500:
            console.error('Internal server error');
            break;
          default:
            console.error('An unexpected error occurred');
        }
        throw error;
      })
    );
  }

  getPokemonById(id: string): Observable<PokemonResponse> {
    return this.http.get<PokemonResponse>(`${envirionment.pokemonUrl}/${id}`).pipe(
      catchError((error) => {
        switch (error.status) {
          case 401:
            console.error('Not authorized');
            break;
          case 404:
            console.error('Pokémon not found');
            break;
          case 500:
            console.error('Internal server error');
            break;
        }

        throw error;
      })
    );
  }
}
