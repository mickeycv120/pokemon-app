import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PokemonDetails } from '../../types/pokemonType';

@Component({
  selector: 'character-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card implements OnInit {
  @Input() pokemon: PokemonDetails | null = null;
  isFavorite = false;

  ngOnInit() {
    console.log('Pokemon data received:', this.pokemon);
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }
}
