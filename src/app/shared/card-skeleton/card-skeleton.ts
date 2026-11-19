import { Component } from '@angular/core';

/** Poster-shaped placeholder that matches a real card, so grids never jump. */
@Component({
  selector: 'app-card-skeleton',
  template: `
    <div class="card-skeleton" aria-hidden="true">
      <div class="poster"></div>
      <div class="line wide"></div>
      <div class="line narrow"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .card-skeleton {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .poster,
    .line {
      position: relative;
      overflow: hidden;
      background: var(--p-surface-800);
    }

    .poster {
      aspect-ratio: 2 / 3;
      border-radius: 0.75rem;
    }

    .line {
      height: 0.7rem;
      border-radius: 0.35rem;

      &.wide {
        width: 72%;
      }

      &.narrow {
        width: 46%;
      }
    }

    .poster::after,
    .line::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent);
      transform: translateX(-100%);
      animation: shimmer 1.4s infinite;
    }

    @keyframes shimmer {
      to {
        transform: translateX(100%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .poster::after,
      .line::after {
        animation: none;
      }
    }
  `,
})
export class CardSkeleton {}
