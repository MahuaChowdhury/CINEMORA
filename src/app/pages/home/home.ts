import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, interval } from 'rxjs';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { Movie, MovieService } from '../../services/movie.service';
import { CardSkeleton } from '../../shared/card-skeleton/card-skeleton';
import { MovieCard } from '../../shared/movie-card/movie-card';

const HERO_ROTATE_MS = 8000;

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, ButtonModule, InputTextModule, MessageModule, CardSkeleton, MovieCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly movieService = inject(MovieService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly genres = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Adventure', 'Drama', 'Romance', 'Mystery', 'Documentary'];

  readonly search = signal('');
  readonly genre = signal('All');
  readonly loading = signal(true);
  readonly error = signal('');
  readonly movies = signal<Movie[]>([]);
  readonly trending = signal<Movie[]>([]);

  readonly heroes = signal<Movie[]>([]);
  readonly heroIndex = signal(0);
  readonly featured = computed(() => this.heroes()[this.heroIndex()] ?? this.heroes()[0]);
  /** Single-item list so the slide markup is rebuilt (and its fade replayed) per hero. */
  readonly heroFrame = computed(() => {
    const hero = this.featured();
    return hero ? [hero] : [];
  });

  private readonly searchInput = new Subject<string>();

  constructor() {
    this.loadFeatured();
    this.filter();

    // Typing shouldn't fire a request per keystroke.
    this.searchInput.pipe(debounceTime(250), takeUntilDestroyed()).subscribe(() => this.filter());
    interval(HERO_ROTATE_MS)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.nextHero());
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.searchInput.next(value);
  }

  goToHero(index: number): void {
    this.heroIndex.set(index);
  }

  /** Backdrop image only — the scrim lives in CSS so it can sit above the Ken Burns layer. */
  heroStyle(movie: Movie | undefined): SafeStyle {
    if (!movie) {
      return '';
    }
    return this.sanitizer.bypassSecurityTrustStyle(`url('${movie.backdrop}')`);
  }

  pickGenre(genre: string): void {
    this.genre.set(genre);
    this.filter();
  }

  filter(): void {
    this.loading.set(true);
    this.error.set('');
    this.movieService.all(this.search(), this.genre()).subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load movies — check that the backend and MongoDB are running.');
        this.loading.set(false);
      },
    });
  }

  private nextHero(): void {
    const count = this.heroes().length;
    if (count > 1) {
      this.heroIndex.update((index) => (index + 1) % count);
    }
  }

  private loadFeatured(): void {
    this.movieService.all().subscribe({
      next: (movies) => {
        const featured = movies.filter((movie) => movie.featured);
        this.heroes.set([...featured, ...movies.filter((movie) => !movie.featured)].slice(0, 5));
        this.trending.set(movies.filter((movie) => movie.trending).slice(0, 10));
      },
      error: () => this.error.set('Could not load movies — check that the backend and MongoDB are running.'),
    });
  }
}
