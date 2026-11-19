import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';

import { AuthService } from '../../services/auth.service';

/** Left rail shared by the social pages: profile card, menu, community hint. */
@Component({
  selector: 'app-app-rail',
  imports: [RouterLink, RouterLinkActive, AvatarModule],
  templateUrl: './app-rail.html',
  styleUrl: './app-rail.scss',
})
export class AppRail {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly initial = computed(() => this.auth.displayName().charAt(0).toUpperCase());
}
