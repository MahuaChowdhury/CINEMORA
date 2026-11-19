import { Injectable, signal } from '@angular/core';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  link: string | null;
  /** Only visible to admins (e.g. the Admin dashboard). */
  adminOnly?: boolean;
}

/** Shared UI state between the shell (header/sidenav) and content pages. */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  /** Primary links in the header and the drawer. */
  readonly navItems: NavItem[] = [
    { id: 'browse', label: 'Home', icon: 'pi pi-home', link: '/home/browse' },
    { id: 'movies', label: 'Movies', icon: 'pi pi-th-large', link: '/home/movies' },
    { id: 'my-list', label: 'My List', icon: 'pi pi-heart', link: '/home/my-list' },
    { id: 'news-feed', label: 'News Feed', icon: 'pi pi-comments', link: '/home/news-feed' },
    { id: 'chat', label: 'Messages', icon: 'pi pi-envelope', link: '/home/chat' },
    { id: 'chatbot', label: 'Mora AI', icon: 'pi pi-star', link: '/home/chatbot' },
    { id: 'admin', label: 'Admin', icon: 'pi pi-cog', link: '/home/admin', adminOnly: true },
  ];

  /** Currently highlighted navigation entry. */
  readonly section = signal<string>('browse');

  selectSection(id: string): void {
    this.section.set(id);
  }
}
