import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MessageModule } from 'primeng/message';

import { Movie, MovieService } from '../../services/movie.service';
import { CardSkeleton } from '../../shared/card-skeleton/card-skeleton';
import { MovieCard } from '../../shared/movie-card/movie-card';

@Component({
  selector: 'app-movies',
  imports: [FormsModule, MessageModule, CardSkeleton, MovieCard],
  templateUrl: './movies.html',
  styleUrl: './movies.scss',
})
export class Movies {
  private readonly movieService = inject(MovieService);

  readonly genres = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Adventure', 'Drama', 'Romance', 'Mystery', 'Documentary'];

  readonly sorts = [
    { id: 'popular', label: 'Popularity' },
    { id: 'newest', label: 'Newest first' },
    { id: 'rating', label: 'Rating' },
    { id: 'az', label: 'Title A–Z' },
  ];

  readonly genre = signal('All');
  readonly sort = signal('popular');
  readonly loading = signal(true);
  readonly error = signal('');

  private readonly catalogue = signal<Movie[]>([]);

  readonly movies = computed(() => {
    const list = [...this.catalogue()];
    switch (this.sort()) {
      case 'newest':
        return list.sort((a, b) => b.year - a.year);
      case 'rating':
        return list.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
      case 'az':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  });

  constructor() {
    this.load();
  }

  pickGenre(genre: string): void {
    if (this.genre() === genre) {
      return;
    }
    this.genre.set(genre);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.movieService.all('', this.genre()).subscribe({
      next: (movies) => {
        this.catalogue.set(movies);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load the catalogue — check that the backend is running.');
        this.loading.set(false);
      },
    });
  }
}
