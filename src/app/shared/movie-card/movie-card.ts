import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { Movie, MovieService } from '../../services/movie.service';
import { WatchlistService } from '../../services/watchlist.service';

/**
 * Poster card with an optional Top-10 rank, an optional badge, an optional
 * action button and hover quick actions (play / My List / info + synopsis).
 */
@Component({
  selector: 'app-movie-card',
  imports: [RouterLink, ButtonModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss',
})
export class MovieCard {
  private readonly movieService = inject(MovieService);
  private readonly watchlist = inject(WatchlistService);

  readonly movie = input.required<Movie>();
  readonly tag = input<string | null>(null);
  readonly rank = input<number | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly actionIcon = input('pi pi-trash');
  readonly action = output<Movie>();

  /** Set once the poster has decoded, so it can fade in over the placeholder. */
  readonly loaded = signal(false);

  readonly saved = computed(() => this.watchlist.has(this.movie()._id));
  readonly link = computed(() => ['/home/movies', this.movie()._id]);

  /** Stable tint derived from the title: the poster's dominant-colour placeholder. */
  readonly tint = computed(() => {
    let hash = 0;
    for (const char of this.movie().title) {
      hash = (hash * 31 + char.charCodeAt(0)) % 360;
    }
    return `hsl(${hash} 42% 14%)`;
  });

  constructor() {
    this.watchlist.ensureLoaded();
  }

  prefetch(): void {
    this.movieService.prefetch(this.movie()._id);
  }

  toggleSaved(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.watchlist.toggle(this.movie()._id);
  }
}
