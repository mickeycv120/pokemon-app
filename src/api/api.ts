import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { envirionment } from '../environments/environment.development';
import { catchError, Observable, map } from 'rxjs';
import { PokemonListResponse, PokemonDetails } from '../types/pokemonType';

@Injectable({
  providedIn: 'root',
})
export class Api {
  constructor(private http: HttpClient) {}

  getPokemons(limit: number = 20, offset: number = 0): Observable<PokemonListResponse> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (offset) params.set('offset', offset.toString());
    
    const url = `${envirionment.pokemonUrl}?${params.toString()}`;
    
    return this.http.get<PokemonListResponse>(url).pipe(
      catchError((error: any) => {
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

  getPokemonById(id: string): Observable<PokemonDetails> {
    return this.http.get<PokemonDetails>(`${envirionment.pokemonUrl}/${id}`).pipe(
      catchError((error: any) => {
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
