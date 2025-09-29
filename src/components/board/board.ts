import { PokemonResponse } from '../../types/pokemonType';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject, signal, effect } from '@angular/core';
import { Card } from '../card/card';
import { Api } from '../../api/api';
import { map, forkJoin, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board',
  imports: [Card, CommonModule],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  api = inject(Api);
  pokemons = toSignal(
    this.api.getPokemons().pipe(
      // Solo obtener next y results
      map((resp: PokemonResponse) => ({ next: resp.next, results: resp.results }))
    ),
    { initialValue: { next: '', results: [] } }
  );

  detailedPokemons = signal<any[]>([]);

  constructor() {
    effect(() => {
      const results = this.pokemons().results;
      if (results.length > 0) {
        // Usar los nombres directamente de los results
        const pokemonNames = results.map((pokemon) => pokemon.name);

        // Hacer peticiones para obtener detalles de cada Pokemon
        if (pokemonNames.length > 0) {
          forkJoin(
            pokemonNames.map((name) =>
              this.api.getPokemonById(name).pipe(
                catchError((err) => {
                  console.error(`Error loading ${name}:`, err);
                  return of(null); // Retorna null si falla
                })
              )
            )
          ).subscribe({
            next: (pokemonDetails) => {
              const validPokemons = pokemonDetails.filter((pokemon) => pokemon !== null);
              this.detailedPokemons.set(validPokemons);
            },
            error: (err) => console.error('Error loading pokemon details:', err),
          });
        }
      }
    });
  }
}
