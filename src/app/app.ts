import { Component, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { Api } from '../api/api';
import { Header } from '../components/header/header/header';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, MatFormFieldModule, MatInputModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('my-app');
  constructor() {
    this.setThemeByPreference();
    // Escucha cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.setThemeByPreference();
    });
  }

  pokemonApi = inject(Api);
  pokemons = toSignal(this.pokemonApi.getPokemons(), {
    initialValue: {
      count: 0,
      next: null,
      previous: null,
      results: [],
    },
  });
  private setThemeByPreference() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}
