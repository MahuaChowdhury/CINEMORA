import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { MessageModule } from 'primeng/message';
import { ChipModule } from 'primeng/chip';

import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

interface BotMessage {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    AvatarModule,
    MessageModule,
    ChipModule,
  ],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss',
})
export class ChatBot {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  readonly messages = signal<BotMessage[]>([]);
  readonly inputText = signal('');
  readonly loading = signal(false);
  readonly error = signal('');

  readonly suggestions = [
    'Recommend a sci-fi movie',
    'How does My List work?',
    'What genres are available?',
    'Help me with login and OTP',
    'Tell me about the Admin Panel',
  ];

  constructor() {
    this.messages.set([
      {
        sender: 'bot',
        text: "Hi! I'm Mora, your CINEMORA concierge. Ask me about movies, My List, genres, or anything about the app!",
      },
    ]);

    // Home page prompt pills deep-link here with a pre-filled question.
    const ask = this.route.snapshot.queryParamMap.get('ask');
    if (ask) {
      this.inputText.set(ask);
    }
  }

  async send() {
    const text = this.inputText().trim();
    if (!text || this.loading()) return;

    this.inputText.set('');
    this.messages.set([...this.messages(), { sender: 'user', text }]);
    this.loading.set(true);
    this.error.set('');

    try {
      const res: { reply: string } = await firstValueFrom(
        this.http.post<{ reply: string }>(`${environment.apiUrl}/messages/chatbot`, { message: text }),
      );
      this.messages.set([...this.messages(), { sender: 'bot', text: res.reply }]);
    } catch (err) {
      // Prefer the API's explanation (not configured, upstream failure) over a generic guess.
      const serverMessage = (err as { error?: { message?: string } })?.error?.message;
      this.error.set(serverMessage || 'Could not reach the chatbot. Check that the backend is running.');
    } finally {
      this.loading.set(false);
    }
  }

  onSuggestion(s: string) {
    this.inputText.set(s);
    this.send();
  }
}
