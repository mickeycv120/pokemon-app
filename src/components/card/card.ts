import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PokemonDetails } from '../../types/pokemonType';
import { Api } from '../../api/api';

@Component({
  selector: 'character-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './card.html',
  styleUrls: ['./card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnInit {
  @Input() pokemon: PokemonDetails | null = null;
  isFavorite = false;

  private readonly api = inject(Api);

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.checkIfFavorite();
  }

  private checkIfFavorite() {
    if (!this.pokemon?.id) return;
    this.isFavorite = this.api.isFavorite(this.pokemon.id);
  }

  toggleFavorite() {
    if (!this.pokemon) return;

    if (this.isFavorite) {
      this.api.removeFromFavorites(this.pokemon.id);
      this.snackBar.open('Removed from favorites', 'Close', { duration: 2000 });
    } else {
      this.api.addToFavorites(this.pokemon);
      this.snackBar.open('Added to favorites!', 'Close', { duration: 2000 });
    }

    this.isFavorite = !this.isFavorite;
  }
}
