import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

export interface PostAuthor {
  _id: string;
  name: string;
  role: 'user' | 'admin';
}

export interface FeedPost {
  _id: string;
  text: string;
  likes: string[];
  createdAt: string;
  user: PostAuthor | null;
}

/** Community feed (posts + likes) of the Express API. */
@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/posts`;

  list() {
    return this.http.get<FeedPost[]>(this.base);
  }

  create(text: string) {
    return this.http.post<FeedPost>(this.base, { text });
  }

  toggleLike(id: string) {
    return this.http.post<{ liked: boolean; likes: string[] }>(`${this.base}/${id}/like`, {});
  }
}
