import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';

import { Movie, MovieService } from '../../services/movie.service';

const GENRES = ['Action', 'Sci-Fi', 'Thriller', 'Adventure', 'Drama', 'Romance', 'Mystery', 'Documentary'];

@Component({
  selector: 'app-admin',
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    SkeletonModule,
    TextareaModule,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private readonly movieService = inject(MovieService);

  readonly genres = GENRES.map((g) => ({ label: g, value: g }));
  readonly movies = signal<Movie[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly editingId = signal<string | null>(null);

  readonly form = {
    title: '',
    description: '',
    genre: 'Action',
    year: 2026,
    duration: '1h 40m',
    rating: 'PG-13',
    poster: '',
    backdrop: '',
    videoUrl: '',
    featured: false,
    trending: false,
  };

  readonly trendingCount = computed(() => this.movies().filter((m) => m.trending).length);
  readonly genresCount = computed(() => new Set(this.movies().map((m) => m.genre)).size);

  private static readonly PALETTE = [
    '#e50914',
    '#fb923c',
    '#f43f5e',
    '#facc15',
    '#38bdf8',
    '#a3e635',
    '#c084fc',
    '#94a3b8',
  ];

  /** Titles per genre, largest first, with the colour used in the donut. */
  readonly genreStats = computed(() => {
    const counts = new Map<string, number>();
    for (const movie of this.movies()) {
      counts.set(movie.genre, (counts.get(movie.genre) ?? 0) + 1);
    }
    const total = this.movies().length || 1;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([genre, count], index) => ({
        genre,
        count,
        pct: Math.round((count / total) * 100),
        color: Admin.PALETTE[index % Admin.PALETTE.length],
      }));
  });

  /** Donut built from a conic gradient — no chart library needed. */
  readonly donutStyle = computed(() => {
    const stats = this.genreStats();
    if (!stats.length) {
      return 'conic-gradient(var(--p-surface-800) 0% 100%)';
    }
    const total = stats.reduce((sum, stat) => sum + stat.count, 0) || 1;
    let at = 0;
    const stops = stats.map((stat) => {
      const from = at;
      at += (stat.count / total) * 100;
      return `${stat.color} ${from}% ${at}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  });

  /** Titles per release year for the last eight years in the catalogue. */
  readonly yearSeries = computed(() => {
    const years = this.movies().map((movie) => movie.year).filter((year) => !!year);
    if (!years.length) {
      return [];
    }
    const max = Math.max(...years);
    const from = Math.max(Math.min(...years), max - 7);
    const buckets: { year: number; count: number }[] = [];
    for (let year = from; year <= max; year++) {
      buckets.push({ year, count: years.filter((value) => value === year).length });
    }
    return buckets;
  });

  readonly sparkPoints = computed(() => {
    const series = this.yearSeries();
    if (series.length < 2) {
      return '';
    }
    const max = Math.max(...series.map((point) => point.count), 1);
    return series
      .map((point, index) => {
        const x = (index / (series.length - 1)) * 100;
        const y = 34 - (point.count / max) * 28;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  });

  readonly sparkArea = computed(() => {
    const points = this.sparkPoints();
    return points ? `0,36 ${points} 100,36` : '';
  });

  constructor() {
    this.load();
  }

  edit(movie: Movie): void {
    this.editingId.set(movie._id);
    Object.assign(this.form, {
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      year: movie.year,
      duration: movie.duration,
      rating: movie.rating,
      poster: movie.poster,
      backdrop: movie.backdrop,
      videoUrl: movie.videoUrl,
      featured: movie.featured,
      trending: movie.trending,
    });
    this.message.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  submit(): void {
    this.saving.set(true);
    this.message.set('');

    const operation = this.editingId()
      ? this.movieService.update(this.editingId()!, { ...this.form })
      : this.movieService.add({ ...this.form });

    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.resetForm();
        this.message.set('Movie saved successfully.');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.message.set(err?.error?.message || 'Save failed.');
      },
    });
  }

  remove(movie: Movie): void {
    if (!confirm(`Delete "${movie.title}"?`)) {
      return;
    }
    this.movieService.remove(movie._id).subscribe({
      next: () => {
        this.message.set('Movie deleted.');
        this.load();
      },
      error: () => this.message.set('Delete failed.'),
    });
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.form.title = '';
    this.form.description = '';
    this.form.genre = 'Action';
    this.form.year = 2026;
    this.form.duration = '1h 40m';
    this.form.rating = 'PG-13';
    this.form.poster = '';
    this.form.backdrop = '';
    this.form.videoUrl = '';
    this.form.featured = false;
    this.form.trending = false;
    this.message.set('');
  }

  private load(): void {
    this.loading.set(true);
    this.movieService.all().subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.loading.set(false);
      },
      error: () => {
        this.message.set('Unable to load movies — check that the backend is running.');
        this.loading.set(false);
      },
    });
  }
}
