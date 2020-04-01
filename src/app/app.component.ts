import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {fetchCountries, fetchGeoJson} from './store/core.actions';
import {fromEvent, timer} from 'rxjs';
import {filter, repeatWhen, shareReplay, takeUntil, tap} from 'rxjs/operators';

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
    private store: Store
  ) {
  }

  ngOnInit(): void {
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
      takeUntil(pageHidden$),
      repeatWhen(() => pageVisible$)
    ).subscribe();
  }
}
