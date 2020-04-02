import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {fetchCountries, fetchGeoJson, fetchHistorical} from './store/core.actions';
import {fromEvent, timer} from 'rxjs';
import {concatMap, filter, repeatWhen, shareReplay, takeUntil, tap} from 'rxjs/operators';
import {SwUpdate} from '@angular/service-worker';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar>
      <img src="/assets/logo.svg" height="40" width="40" alt="log"/>
      <a mat-icon-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        <mat-icon>sort</mat-icon>
      </a>
      <a mat-icon-button routerLink="map" routerLinkActive="active">
        <mat-icon>map</mat-icon>
      </a>
      <a mat-icon-button routerLink="about" routerLinkActive="active">
        <mat-icon>help</mat-icon>
      </a>
    </mat-toolbar>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    mat-toolbar {
      flex: 0 0 56px;
    }

    img {
      margin-right: auto;
    }

    a {
      color: white;
    }

    a.active {
      color: #4caf50;
    }

    a:not(:last-child) {
      margin-right: 8px;
    }

    main {
      flex: 1 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

  constructor(
    private store: Store,
    private updates: SwUpdate,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });

    this.updates.available.pipe(
      concatMap(() => this.snackBar.open('A new version is available.', 'Reload').afterDismissed()),
      tap(() => this.updates.activateUpdate().then(() => document.location.reload()))
    ).subscribe();

    this.store.dispatch(fetchGeoJson());

    const visibilityChange$ = fromEvent(document, 'visibilitychange').pipe(
      shareReplay({refCount: true, bufferSize: 1})
    );
    const pageVisible$ = visibilityChange$.pipe(
      filter(() => document.visibilityState === 'visible')
    );
    const pageHidden$ = visibilityChange$.pipe(
      filter(() => document.visibilityState === 'hidden')
    );

    timer(0, 1000 * 60).pipe(
      tap(() => this.store.dispatch(fetchCountries())),
      tap(() => this.store.dispatch(fetchHistorical())),
      takeUntil(pageHidden$),
      repeatWhen(() => pageVisible$)
    ).subscribe();
  }
}
