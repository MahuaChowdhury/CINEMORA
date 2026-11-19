import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, tap } from 'rxjs';

import { environment } from '../../environments/environment';

export interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string;
  year: number;
  duration: string;
  rating: string;
  poster: string;
  backdrop: string;
  videoUrl: string;
  featured: boolean;
  trending: boolean;
}

/** Catalog + watchlist endpoints of the Express API. */
@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);

  /** Detail responses, warmed by card hover so a click renders instantly. */
  private readonly detailCache = new Map<string, Movie>();

  /** All movies, optionally filtered by title search and genre. */
  all(search = '', genre = 'All') {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    if (genre !== 'All') {
      params = params.set('genre', genre);
    }
    return this.http.get<Movie[]>(`${environment.apiUrl}/movies`, { params });
  }

  one(id: string) {
    const cached = this.detailCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http
      .get<Movie>(`${environment.apiUrl}/movies/${id}`)
      .pipe(tap((movie) => this.detailCache.set(movie._id, movie)));
  }

  /** Best-effort preload of a detail response (hover / focus on a poster). */
  prefetch(id: string): void {
    if (!id || this.detailCache.has(id)) {
      return;
    }
    this.http.get<Movie>(`${environment.apiUrl}/movies/${id}`).subscribe({
      next: (movie) => this.detailCache.set(movie._id, movie),
      error: () => {
        // Preloading is optional; the real navigation still loads it.
      },
    });
  }

  add(movie: Partial<Movie>) {
    return this.http.post<Movie>(`${environment.apiUrl}/movies`, movie);
  }

  update(id: string, movie: Partial<Movie>) {
    this.detailCache.delete(id);
    return this.http.put<Movie>(`${environment.apiUrl}/movies/${id}`, movie);
  }

  remove(id: string) {
    this.detailCache.delete(id);
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/movies/${id}`);
  }

  // ---- Watchlist ("My List") ----

  list() {
    return this.http.get<Movie[]>(`${environment.apiUrl}/watchlist`);
  }

  save(id: string) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/watchlist/${id}`, {});
  }

  unsave(id: string) {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/watchlist/${id}`);
  }
}
