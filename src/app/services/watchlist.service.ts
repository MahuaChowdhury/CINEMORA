import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../environments/environment';
import { Movie } from './movie.service';

/**
 * Shared "My List" state so every poster, the detail page and search agree on
 * what is saved. Toggles are optimistic: the UI flips instantly and the request
 * rolls it back if the API rejects it.
 */
@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly http = inject(HttpClient);

  private readonly saved = signal<ReadonlySet<string>>(new Set());
  private requested = false;

  readonly ids = this.saved.asReadonly();

  has(id: string): boolean {
    return this.saved().has(id);
  }

  /** Fetches the saved ids once; later calls are no-ops. */
  ensureLoaded(): void {
    if (this.requested) {
      return;
    }
    this.requested = true;
    this.http.get<Movie[]>(`${environment.apiUrl}/watchlist`).subscribe({
      next: (movies) => this.saved.set(new Set(movies.map((movie) => movie._id))),
      error: () => {
        // Let the next card retry instead of caching a failed load forever.
        this.requested = false;
      },
    });
  }

  /** Optimistic toggle with rollback on failure. */
  toggle(id: string, onError?: () => void): void {
    if (!id) {
      return;
    }
    const wasSaved = this.has(id);
    this.apply(id, !wasSaved);

    const request = wasSaved
      ? this.http.delete<{ message: string }>(`${environment.apiUrl}/watchlist/${id}`)
      : this.http.post<{ message: string }>(`${environment.apiUrl}/watchlist/${id}`, {});

    request.subscribe({
      error: () => {
        this.apply(id, wasSaved);
        onError?.();
      },
    });
  }

  /** Sets the state directly (used when another view already changed it). */
  mark(id: string, saved: boolean): void {
    this.apply(id, saved);
  }

  private apply(id: string, saved: boolean): void {
    this.saved.update((current) => {
      const next = new Set(current);
      if (saved) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }
}
