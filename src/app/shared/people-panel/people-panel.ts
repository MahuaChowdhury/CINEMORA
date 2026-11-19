import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../services/auth.service';
import { ChatService, ChatUser } from '../../services/chat.service';

/** Right-hand "People" directory; picking someone opens a private chat with them. */
@Component({
  selector: 'app-people-panel',
  imports: [AvatarModule, ButtonModule],
  templateUrl: './people-panel.html',
  styleUrl: './people-panel.scss',
})
export class PeoplePanel {
  private readonly chat = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly users = signal<ChatUser[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const users = await firstValueFrom(this.chat.loadUsers());
      const me = this.auth.user()?.id;
      this.users.set(users.filter((u) => u._id !== me));
    } catch {
      this.error.set('Could not load people.');
    } finally {
      this.loading.set(false);
    }
  }

  message(user: ChatUser): void {
    this.router.navigate(['/home/chat'], { queryParams: { with: user._id } });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
