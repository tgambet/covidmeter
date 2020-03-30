import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {fetchCountries} from './store/core.actions';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar>
      <img src="/assets/logo.svg" height="40" width="40" alt="log" />
      <a mat-icon-button routerLink="/">
        <mat-icon>sort</mat-icon>
      </a>
      <a mat-icon-button routerLink="map">
        <mat-icon>map</mat-icon>
      </a>
      <a mat-icon-button routerLink="about">
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
    this.store.dispatch(fetchCountries());
  }
}
