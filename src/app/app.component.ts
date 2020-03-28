import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {fetchCountries} from "./store/core.actions";

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar>
      CovidMeter <!--<mat-icon>home</mat-icon> <mat-icon>map</mat-icon>-->
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
    main {
      flex: 1 0 auto;
      padding: 16px;
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
