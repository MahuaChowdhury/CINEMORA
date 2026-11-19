import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';

import { AuthService } from '../../services/auth.service';
import { ChatService, ChatUser } from '../../services/chat.service';
import { AppRail } from '../../shared/app-rail/app-rail';
import { PeoplePanel } from '../../shared/people-panel/people-panel';

@Component({
  selector: 'app-chat',
  imports: [
    DatePipe,
    FormsModule,
    AvatarModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SkeletonModule,
    AppRail,
    PeoplePanel,
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat {
  private readonly chat = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly me = this.auth.user;
  readonly connected = this.chat.connected;
  readonly messages = this.chat.messages;
  readonly error = this.chat.error;

  /** Everyone except the signed-in user; used to resolve ?with=<id> to a person. */
  private readonly directory = signal<ChatUser[]>([]);
  readonly selectedUser = signal<ChatUser | null>(null);
  readonly messageText = signal('');
  readonly loadingHistory = signal(false);

  readonly activeMessages = computed(() =>
    this.messages().filter(
      (m) =>
        (m.sender === this.me()?.id && m.receiver === this.selectedUser()?._id) ||
        (m.sender === this.selectedUser()?._id && m.receiver === this.me()?.id),
    ),
  );

  constructor() {
    this.chat.connect();
    void this.watchSelection();
  }

  /** The People panel links here with ?with=<userId>; keep the selection in sync with the URL. */
  private async watchSelection(): Promise<void> {
    try {
      this.directory.set(await firstValueFrom(this.chat.loadUsers()));
    } catch {
      // The People panel reports its own error; the URL still drives the conversation.
    }

    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('with');
      const user = id ? (this.directory().find((u) => u._id === id) ?? null) : null;

      if (!user) {
        this.selectedUser.set(null);
        this.messages.set([]);
        return;
      }
      if (user._id !== this.selectedUser()?._id) {
        this.select(user);
      }
    });
  }

  select(user: ChatUser): void {
    this.selectedUser.set(user);
    this.messageText.set('');
    void this.loadHistory(user);
  }

  closeConversation(): void {
    void this.router.navigate(['/home/chat']);
  }

  async loadHistory(user: ChatUser): Promise<void> {
    this.loadingHistory.set(true);
    try {
      this.chat.messages.set(await firstValueFrom(this.chat.loadHistory(user._id)));
    } catch {
      this.error.set('Could not load message history');
    } finally {
      this.loadingHistory.set(false);
    }
  }

  async sendMessage(): Promise<void> {
    const text = this.messageText().trim();
    const user = this.selectedUser();
    if (!text || !user) {
      return;
    }
    if (!this.connected()) {
      this.error.set('Chat server not connected');
      return;
    }

    const result = await this.chat.send(user._id, text);
    if (!result.ok) {
      this.error.set(result.error || 'Message failed');
      this.messageText.set(text);
      return;
    }
    this.messageText.set('');
    this.error.set('');
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
