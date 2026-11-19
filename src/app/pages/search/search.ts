import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { Movie, MovieService } from '../../services/movie.service';
import { CardSkeleton } from '../../shared/card-skeleton/card-skeleton';
import { MovieCard } from '../../shared/movie-card/movie-card';

@Component({
  selector: 'app-search-results',
  imports: [FormsModule, InputTextModule, MessageModule, CardSkeleton, MovieCard],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchResults {
  private readonly movieService = inject(MovieService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly genres = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Adventure', 'Drama', 'Romance', 'Mystery', 'Documentary'];

  readonly sorts = [
    { id: 'relevance', label: 'Relevance' },
    { id: 'newest', label: 'Newest first' },
    { id: 'az', label: 'Title A–Z' },
  ];

  readonly query = signal('');
  readonly genre = signal('All');
  readonly sort = signal('relevance');
  readonly searchedTerm = signal('');
  readonly loading = signal(false);
  readonly error = signal('');

  private readonly matches = signal<Movie[]>([]);
  private readonly typed = new Subject<string>();

  readonly results = computed(() => {
    const list = this.matches().filter((m) => this.genre() === 'All' || m.genre === this.genre());
    switch (this.sort()) {
      case 'newest':
        return [...list].sort((a, b) => b.year - a.year);
      case 'az':
        return [...list].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const term = (params.get('q') ?? '').trim();
      this.query.set(term);
      this.search(term);
    });

    // Suggest-as-you-type: results follow the input, but history stays clean.
    this.typed.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((term) => {
      void this.router.navigate(['/home/search'], {
        queryParams: { q: term.trim() || null },
        replaceUrl: true,
      });
    });
  }

  onInput(value: string): void {
    this.query.set(value);
    this.typed.next(value);
  }

  submit(): void {
    const term = this.query().trim();
    this.typed.next(term);
    void this.router.navigate(['/home/search'], { queryParams: { q: term || null } });
  }

  private search(term: string): void {
    this.searchedTerm.set(term);
    if (!term) {
      this.matches.set([]);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.movieService.all(term, 'All').subscribe({
      next: (movies) => {
        this.matches.set(movies);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Search failed — check that the backend is running.');
        this.loading.set(false);
      },
    });
  }
}
