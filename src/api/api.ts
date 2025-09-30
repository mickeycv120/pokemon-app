import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { envirionment } from '../environments/environment.development';
import { catchError, Observable, of, tap } from 'rxjs';
import { PokemonListResponse, PokemonDetails, PokemonResultType } from '../types/pokemonType';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private pokemonCache: {[key: string]: any} = {};
  private allPokemonList: PokemonResultType[] = [];
  private currentOffset: number = 0;
  private readonly limit: number = 20;

  constructor(private http: HttpClient) {}

  getPokemons(limit: number = this.limit, offset: number = this.currentOffset, forceRefresh: boolean = false): Observable<PokemonListResponse> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (offset) params.set('offset', offset.toString());

    const url = `${envirionment.pokemonUrl}?${params.toString()}`;
    const cacheKey = `pokemons_${offset}_${limit}`;
    
    // Return cached data if available and not forcing refresh
    if (this.pokemonCache[cacheKey] && !forceRefresh) {
      return of(this.pokemonCache[cacheKey]);
    }

    return this.http.get<PokemonListResponse>(url).pipe(
      tap(response => {
        // Cache the response
        this.pokemonCache[cacheKey] = response;
        // Store all Pokémon for quick access
        this.allPokemonList = [...this.allPokemonList, ...response.results];
        this.currentOffset = offset;
      }),
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
    const cacheKey = `pokemon_${id}`;
    
    // Return cached data if available
    if (this.pokemonCache[cacheKey]) {
      return of(this.pokemonCache[cacheKey]);
    }

    return this.http.get<PokemonDetails>(`${envirionment.pokemonUrl}/${id}`).pipe(
      tap(pokemon => {
        // Cache the Pokémon details
        this.pokemonCache[cacheKey] = pokemon;
      }),
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

  private readonly FAVORITES_KEY = 'pokemon_favorites';

  getFavorites(): PokemonDetails[] {
    const favoritesJson = localStorage.getItem(this.FAVORITES_KEY);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  }

  getFavoritesList(): Observable<PokemonListResponse> {
    const favorites = this.getFavorites();
    const response: PokemonListResponse = {
      next: null,
      previous: null,
      results: favorites.map((p: PokemonDetails) => ({
        name: p.name,
        url: `${envirionment.pokemonUrl}/${p.id}/`,
      })),
      count: favorites.length,
    };
    return of(response);
  }

  addToFavorites(pokemon: PokemonDetails): void {
    const favorites = this.getFavorites();
    if (!favorites.some((p: PokemonDetails) => p.id === pokemon.id)) {
      favorites.push(pokemon);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  removeFromFavorites(pokemonId: number): void {
    const favorites = this.getFavorites().filter(p => p.id !== pokemonId);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
  }

  isFavorite(pokemonId: number): boolean {
    return this.getFavorites().some(p => p.id === pokemonId);
  }
}
