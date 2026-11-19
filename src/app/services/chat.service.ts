import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, type Socket } from 'socket.io-client';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ChatUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  text: string;
  createdAt: string;
}

/**
 * Real-time chat (Socket.IO) + message history (HTTP) for CINEMORA.
 * The socket authenticates with the same JWT used by the REST API.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private socket: Socket | null = null;
  readonly connected = signal(false);
  readonly users = signal<ChatUser[]>([]);
  readonly messages = signal<ChatMessage[]>([]);
  readonly error = signal('');

  private base = `${environment.apiUrl}/messages`;

  /** Open the Socket.IO connection and join the current user's room. */
  connect(): void {
    const token = localStorage.getItem('netflix-clone:token');
    if (!token) {
      this.error.set('Not logged in');
      return;
    }
    if (this.socket?.connected) return;

    this.socket = io(environment.apiUrl.replace('/api', ''), {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    this.socket.on('connect', () => {
      this.connected.set(true);
      this.error.set('');
    });

    this.socket.on('disconnect', () => {
      this.connected.set(false);
    });

    this.socket.on('new_message', (msg: ChatMessage) => {
      const current = this.messages();
      if (!current.some((m) => m._id === msg._id)) {
        this.messages.set([...current, msg]);
      }
    });

    this.socket.connect();
  }

  /** Close the socket connection. */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connected.set(false);
    this.messages.set([]);
  }

  /** Fetch all users (for the chat directory). */
  loadUsers() {
    return this.http.get<ChatUser[]>(`${this.base}/users`);
  }

  /** Fetch message history between two users. */
  loadHistory(otherUserId: string) {
    const me = this.auth.user()?.id;
    if (!me) {
      throw new Error('Not logged in');
    }
    return this.http.get<ChatMessage[]>(`${this.base}/${me}/${otherUserId}`);
  }

  /** Send a message via Socket.IO. Returns a Promise resolving to { ok, error? }. */
  send(receiverId: string, text: string): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ ok: false, error: 'Not connected to chat server' });
        return;
      }
      this.socket.emit(
        'send_message',
        { receiver: receiverId, text },
        (result: { ok: boolean; error?: string }) => resolve(result ?? { ok: false, error: 'No response' }),
      );
    });
  }
}
