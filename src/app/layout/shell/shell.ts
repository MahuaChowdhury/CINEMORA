import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subject, catchError, debounceTime, of, switchMap } from 'rxjs';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';

import { AuthService } from '../../services/auth.service';
import { LayoutService } from '../../services/layout.service';
import { Movie, MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    AvatarModule,
    ButtonModule,
    DrawerModule,
    InputTextModule,
    MenuModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly router = inject(Router);
  private readonly movies = inject(MovieService);
  readonly auth = inject(AuthService);
  readonly layout = inject(LayoutService);

  /** True while the sidenav drawer is open. */
  readonly sidenav = signal(false);

  /** Header search box; submitting it opens the search results page. */
  readonly query = signal('');

  readonly suggestions = signal<Movie[]>([]);
  readonly suggestOpen = signal(false);

  private readonly typed = new Subject<string>();

  readonly userInitial = signal(this.auth.displayName().charAt(0).toUpperCase());
  readonly isAdmin = this.auth.isAdmin;

  readonly userMenuItems: MenuItem[] = [
    { label: this.auth.displayName(), disabled: true, styleClass: 'user-menu-title' },
    { separator: true },
    { label: 'My List', icon: 'pi pi-heart', command: () => this.router.navigate(['/home/my-list']) },
    { label: 'News Feed', icon: 'pi pi-comments', command: () => this.router.navigate(['/home/news-feed']) },
    { label: 'Messages', icon: 'pi pi-envelope', command: () => this.router.navigate(['/home/chat']) },
    { label: 'Mora AI', icon: 'pi pi-star', command: () => this.router.navigate(['/home/chatbot']) },
    ...(this.auth.isAdmin()
      ? [{
          label: 'Admin Panel',
          icon: 'pi pi-cog',
          command: () => this.router.navigate(['/home/admin']),
        } as MenuItem]
      : []),
    { separator: true },
    {
      label: 'Sign Out',
      icon: 'pi pi-sign-out',
      command: () => {
        this.auth.signOut();
        this.router.navigate(['/login']);
      },
    },
  ];

  constructor() {
    this.typed
      .pipe(
        debounceTime(250),
        switchMap((term) =>
          term.length < 2
            ? of<Movie[]>([])
            : this.movies.all(term, 'All').pipe(catchError(() => of<Movie[]>([]))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((movies) => this.suggestions.set(movies.slice(0, 6)));
  }

  onQuery(value: string): void {
    this.query.set(value);
    this.suggestOpen.set(value.trim().length >= 2);
    this.typed.next(value.trim());
  }

  openSuggestions(): void {
    this.suggestOpen.set(this.query().trim().length >= 2);
  }

  /** Delayed so a click on a suggestion lands before the panel closes. */
  closeSuggestions(): void {
    setTimeout(() => this.suggestOpen.set(false), 130);
  }

  openSuggestion(movie: Movie): void {
    this.suggestOpen.set(false);
    this.query.set('');
    this.suggestions.set([]);
    void this.router.navigate(['/home/movies', movie._id]);
  }

  search(): void {
    const term = this.query().trim();
    if (!term) {
      return;
    }
    this.suggestOpen.set(false);
    void this.router.navigate(['/home/search'], { queryParams: { q: term } });
  }

  onNavClick(id: string): void {
    this.layout.selectSection(id);
    this.sidenav.set(false);
  }
}
