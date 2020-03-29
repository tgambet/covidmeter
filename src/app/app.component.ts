import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {fetchCountries} from './store/core.actions';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar>
      <a routerLink="/">CovidMeter</a>
      <button mat-icon-button routerLink="/">
        <mat-icon>sort</mat-icon>
      </button>
      <button mat-icon-button routerLink="map">
        <mat-icon>map</mat-icon>
      </button>
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
    a {
      color: white;
    }
    main {
      flex: 1 0 auto;
      width: 100%;
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
