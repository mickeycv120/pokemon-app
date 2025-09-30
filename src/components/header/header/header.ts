import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  showOnlyFavorites = signal(false);

  toggleFavoritesView(): void {
    this.showOnlyFavorites.update(value => !value);
    // Emit an event or use a service to notify the board component
    // This is a simple implementation - you might want to use a service for better component communication
    const event = new CustomEvent('favoritesToggled', { 
      detail: { showFavorites: this.showOnlyFavorites() } 
    });
    window.dispatchEvent(event);
  }
}
