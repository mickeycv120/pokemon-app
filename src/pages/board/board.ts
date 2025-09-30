import { PokemonListResponse, PokemonResultType, PokemonDetails } from '../../types/pokemonType';
import { Component, inject, signal } from '@angular/core';
import { Card } from '../../components/card/card';
import { Api } from '../../api/api';
import { forkJoin, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [Card, CommonModule, FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  private readonly api = inject(Api);
  private readonly limit = 20;
  private offset = 0;
  
  currentPage = signal(1);
  totalPages = signal(1);
  isLoading = signal(false);
  
  pokemons = signal<PokemonListResponse>({
    next: null,
    previous: null,
    results: [],
    count: 0
  });

  detailedPokemons = signal<PokemonDetails[]>([]);

  constructor() {
    this.loadPokemons(this.offset);
  }

  loadPokemons(offset: number): void {
    this.isLoading.set(true);
    this.offset = offset;
    
    this.api.getPokemons(this.limit, offset).subscribe({
      next: (data: PokemonListResponse) => {
        this.pokemons.set({
          next: data.next,
          previous: data.previous,
          results: data.results,
          count: data.count
        });
        this.totalPages.set(Math.ceil(data.count / this.limit));
        this.currentPage.set(Math.floor(offset / this.limit) + 1);
        this.loadPokemonDetails(data.results);
      },
      error: (err) => {
        console.error('Error loading pokemons:', err);
        this.isLoading.set(false);
      }
    });
  }

  private loadPokemonDetails(results: PokemonResultType[]): void {
    if (results.length === 0) {
      this.isLoading.set(false);
      return;
    }

    const pokemonRequests = results.map((pokemon) =>
      this.api.getPokemonById(pokemon.name).pipe(
        catchError((err) => {
          console.error(`Error loading ${pokemon.name}:`, err);
          return of(null);
        })
      )
    );

    forkJoin(pokemonRequests).subscribe({
      next: (pokemonDetails) => {
        const validPokemons = pokemonDetails.filter((pokemon): pokemon is PokemonDetails => pokemon !== null);
        this.detailedPokemons.set(validPokemons);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading pokemon details:', err);
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    
    const newOffset = (page - 1) * this.limit;
    this.loadPokemons(newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' } as ScrollToOptions);
  }
}
