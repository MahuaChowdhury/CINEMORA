import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MessageModule } from 'primeng/message';

import { Movie, MovieService } from '../../services/movie.service';
import { WatchlistService } from '../../services/watchlist.service';
import { CardSkeleton } from '../../shared/card-skeleton/card-skeleton';
import { MovieCard } from '../../shared/movie-card/movie-card';

@Component({
  selector: 'app-my-list',
  imports: [RouterLink, MessageModule, CardSkeleton, MovieCard],
  templateUrl: './my-list.html',
  styleUrl: './my-list.scss',
})
export class MyList {
  private readonly movieService = inject(MovieService);
  private readonly watchlist = inject(WatchlistService);

  readonly movies = signal<Movie[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.load();
  }

  /** Removes the card immediately and restores it only if the API rejects it. */
  remove(movie: Movie): void {
    const snapshot = this.movies();
    this.movies.set(snapshot.filter((item) => item._id !== movie._id));
    this.watchlist.mark(movie._id, false);
    this.error.set('');

    this.movieService.unsave(movie._id).subscribe({
      error: () => {
        this.movies.set(snapshot);
        this.watchlist.mark(movie._id, true);
        this.error.set('Could not remove the movie. Please try again.');
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.movieService.list().subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your list — check that the backend is running.');
        this.loading.set(false);
      },
    });
  }
}
