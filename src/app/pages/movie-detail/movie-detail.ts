import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { Movie, MovieService } from '../../services/movie.service';
import { WatchlistService } from '../../services/watchlist.service';
import { MovieCard } from '../../shared/movie-card/movie-card';

@Component({
  selector: 'app-movie-detail',
  imports: [RouterLink, ButtonModule, MessageModule, MovieCard],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.scss',
})
export class MovieDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly movieService = inject(MovieService);
  private readonly watchlist = inject(WatchlistService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly movie = signal<Movie | undefined>(undefined);
  readonly related = signal<Movie[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly playing = signal(false);
  readonly message = signal('');

  readonly saved = computed(() => {
    const movie = this.movie();
    return movie ? this.watchlist.has(movie._id) : false;
  });

  readonly backdropStyle = computed<SafeStyle>(() => {
    const movie = this.movie();
    if (!movie) {
      return '';
    }
    return this.sanitizer.bypassSecurityTrustStyle(
      `linear-gradient(90deg, #09090b 5%, rgba(9,9,11,0.7) 56%, transparent),
       linear-gradient(0deg, #09090b, transparent 50%),
       url('${movie.backdrop}')`,
    );
  });

  constructor() {
    this.watchlist.ensureLoaded();
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.movieService.one(id).subscribe({
      next: (movie) => {
        this.movie.set(movie);
        this.loading.set(false);
        this.loadRelated(movie);
      },
      error: () => {
        this.error.set('Movie not found.');
        this.loading.set(false);
      },
    });
  }

  /** Flips the button immediately; the store rolls it back if the API fails. */
  toggleList(): void {
    const movie = this.movie();
    if (!movie) {
      return;
    }
    this.watchlist.toggle(movie._id, () => this.message.set('Could not update your list.'));
    this.message.set(this.saved() ? 'Added to My List' : 'Removed from My List');
  }

  /** More titles from the same genre, shown under the details. */
  private loadRelated(movie: Movie): void {
    this.movieService.all('', movie.genre).subscribe({
      next: (movies) =>
        this.related.set(movies.filter((item) => item._id !== movie._id).slice(0, 6)),
      error: () => {
        // Related titles are optional; the page stays usable without them.
      },
    });
  }
}
