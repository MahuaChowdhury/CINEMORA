import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';

import { AuthService } from '../../services/auth.service';
import { FeedPost, PostService } from '../../services/post.service';
import { AppRail } from '../../shared/app-rail/app-rail';
import { PeoplePanel } from '../../shared/people-panel/people-panel';

@Component({
  selector: 'app-news-feed',
  imports: [DatePipe, FormsModule, AvatarModule, ButtonModule, MessageModule, SkeletonModule, AppRail, PeoplePanel],
  templateUrl: './news-feed.html',
  styleUrl: './news-feed.scss',
})
export class NewsFeed {
  private readonly posts = inject(PostService);
  private readonly auth = inject(AuthService);

  readonly maxLength = 500;

  readonly items = signal<FeedPost[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly draft = signal('');
  readonly publishing = signal(false);

  constructor() {
    this.load();
  }

  get initial(): string {
    return this.auth.displayName().charAt(0).toUpperCase();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.posts.list().subscribe({
      next: (posts) => {
        this.items.set(posts);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load the news feed — check that the backend is running.');
        this.loading.set(false);
      },
    });
  }

  publish(): void {
    const text = this.draft().trim();
    if (!text || this.publishing()) {
      return;
    }
    this.publishing.set(true);
    this.error.set('');
    this.posts.create(text).subscribe({
      next: (post) => {
        this.items.update((list) => [post, ...list]);
        this.draft.set('');
        this.publishing.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Could not publish your post.');
        this.publishing.set(false);
      },
    });
  }

  /** Heart flips instantly, then reconciles (or rolls back) with the server. */
  toggleLike(post: FeedPost): void {
    const me = this.auth.user()?.id;
    if (!me) {
      return;
    }

    const wasLiked = post.likes.includes(me);
    const optimistic = wasLiked ? post.likes.filter((id) => id !== me) : [...post.likes, me];
    this.applyLikes(post._id, optimistic);

    this.posts.toggleLike(post._id).subscribe({
      next: (result) => this.applyLikes(post._id, result.likes),
      error: () => {
        this.applyLikes(post._id, post.likes);
        this.error.set('Could not update the like. Please try again.');
      },
    });
  }

  private applyLikes(id: string, likes: string[]): void {
    this.items.update((list) =>
      list.map((item) => (item._id === id ? { ...item, likes } : item)),
    );
  }

  likedByMe(post: FeedPost): boolean {
    const me = this.auth.user()?.id;
    return !!me && post.likes.includes(me);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
