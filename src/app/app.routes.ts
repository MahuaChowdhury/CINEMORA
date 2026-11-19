import { Routes } from '@angular/router';

import { adminGuard, authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    title: 'CINEMORA – Sign In',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'CINEMORA – Create Account',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'verify-otp',
    title: 'CINEMORA – Verify Email',
    loadComponent: () => import('./pages/verify-otp/verify-otp').then((m) => m.VerifyOtp),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'browse',
      },
      {
        path: 'browse',
        title: 'CINEMORA – Browse',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'movies',
        title: 'CINEMORA – Movies & Series',
        loadComponent: () => import('./pages/movies/movies').then((m) => m.Movies),
      },
      {
        path: 'search',
        title: 'CINEMORA – Search',
        loadComponent: () => import('./pages/search/search').then((m) => m.SearchResults),
      },
      {
        path: 'movies/:id',
        title: 'CINEMORA – Watch',
        loadComponent: () =>
          import('./pages/movie-detail/movie-detail').then((m) => m.MovieDetail),
      },
      {
        path: 'news-feed',
        title: 'CINEMORA – News Feed',
        loadComponent: () => import('./pages/news-feed/news-feed').then((m) => m.NewsFeed),
      },
      {
        path: 'my-list',
        title: 'CINEMORA – My List',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/my-list/my-list').then((m) => m.MyList),
      },
      {
        path: 'admin',
        title: 'CINEMORA – Admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
      },
      {
        path: 'chat',
        title: 'CINEMORA – Messages',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/chat/chat').then((m) => m.Chat),
      },
      {
        path: 'chatbot',
        title: 'CINEMORA – Mora AI',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/chatbot/chatbot').then((m) => m.ChatBot),
      },
      {
        path: '**',
        title: 'CINEMORA – Not Found',
        loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
  {
    path: '**',
    title: 'CINEMORA – Not Found',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
