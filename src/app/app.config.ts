import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  PreloadAllModules,
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { tokenInterceptor } from './services/auth.service';

/** Netflix-flavoured variant of the Aura preset (dark UI + red primary). */
const netflixPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#ffe5e7',
      100: '#ffc6c9',
      200: '#ff9ba0',
      300: '#ff6b72',
      400: '#ff3c44',
      500: '#e50914',
      600: '#c80812',
      700: '#a0070e',
      800: '#78060b',
      950: '#4a0306',
    },
  },
});

/**
 * PrimeNG 22 uses the PrimeUI license model. Use of the library without a key
 * shows a small license banner (app still works). Get your key:
 *   - Community (free): https://primeui.dev/licenses/community
 *   - Commercial:       https://primeui.dev/licenses/commercial
 * Then paste it below.
 */
const PRIMENG_LICENSE =
  'eyJpZCI6ImE3Y2I5NTkxLTdlYjAtNDBlMy05ZjhhLTAzNzZjNWZmMjMwNyIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODkxMjI0NzksImV4cCI6MTgyMDY1ODQ3OX0.xyawuqXPQr1a588lirc0y4FUzf9dolcZCZ-5M85GbkC5rECnEhdyosnqdZFiXyR9g7N83WM18ZOBttBTgsmABg';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideRouter(
      routes,
      // Lazy route chunks still load on demand, but preload in the background
      // once the first page is interactive, so later navigation is instant.
      withPreloading(PreloadAllModules),
      // Restores the previous offset on back/forward, top on fresh navigation.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    providePrimeNG({
      ripple: true,
      license: PRIMENG_LICENSE || undefined,
      theme: {
        preset: netflixPreset,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
  ],
};
