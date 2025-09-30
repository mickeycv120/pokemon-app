import { PokemonListResponse, PokemonResultType, PokemonDetails } from '../../types/pokemonType';
import { Component, inject, signal } from '@angular/core';
import { CardComponent } from '../../components/card/card';
import { Api } from '../../api/api';
import { forkJoin, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CardComponent, CommonModule, FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  private readonly api = inject(Api);
  private params = new URLSearchParams();
  private readonly limit = 20;
  private offset = 0;

  currentPage = signal(1);
  totalPages = signal(1);
  isLoading = signal(false);

  pokemons = signal<PokemonListResponse>({
    next: null,
    previous: null,
    results: [],
    count: 0,
  });

  detailedPokemons = signal<PokemonDetails[]>([]);
  showOnlyFavorites = signal(false);

  constructor() {
    this.loadPokemons(this.offset);
    
    // Listen for favorites toggle event from header
    window.addEventListener('favoritesToggled', (event: any) => {
      this.showOnlyFavorites.set(event.detail.showFavorites);
      if (event.detail.showFavorites) {
        this.loadFavorites();
      } else {
        this.loadPokemons(this.offset);
      }
    });
  }

  toggleFavoritesView(): void {
    // This method is kept for backward compatibility
    // The actual toggle is now handled by the header component
    this.showOnlyFavorites.update((value) => !value);
    if (this.showOnlyFavorites()) {
      this.loadFavorites();
    } else {
      this.loadPokemons(this.offset);
    }
  }

  private loadFavorites(): void {
    this.isLoading.set(true);
    this.api.getFavoritesList().subscribe({
      next: (data: PokemonListResponse) => {
        this.pokemons.set({
          next: data.next,
          previous: data.previous,
          results: data.results,
          count: data.count,
        });
        // Since we already have the full details in the favorites, we can set them directly
        this.detailedPokemons.set(this.api.getFavorites());
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.isLoading.set(false);
      }
    });
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
          count: data.count,
        });
        this.totalPages.set(Math.ceil(data.count / this.limit));
        this.currentPage.set(Math.floor(offset / this.limit) + 1);
        this.loadPokemonDetails(data.results);
      },
      error: (err) => {
        console.error('Error loading pokemons:', err);
        this.isLoading.set(false);
      },
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
        const validPokemons = pokemonDetails.filter(
          (pokemon): pokemon is PokemonDetails => pokemon !== null
        );
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
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);

    if (this.showOnlyFavorites()) {
      const start = (page - 1) * this.limit;
      const end = start + this.limit;
      const favorites = this.api.getFavorites();
      this.detailedPokemons.set(favorites.slice(start, end));
    } else {
      this.loadPokemons((page - 1) * this.limit);
    }
  }
}
