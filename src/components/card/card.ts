import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PokemonType } from '../../types/pokemonType';

@Component({
  selector: 'character-card',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card implements OnInit {
  @Input() pokemon: PokemonType | null = null;

  ngOnInit() {
    console.log('Pokemon data received:', this.pokemon);
  }
}
