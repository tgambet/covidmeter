import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {getFilterFrom} from './store/core.selectors';
import {Observable} from 'rxjs';
import {setFilterFrom} from './store/core.actions';

@Component({
  selector: 'app-world',
  template: `
    <app-overview>
      <span>World overview</span>
      <mat-icon>language</mat-icon>
    </app-overview>
    <app-timeline></app-timeline>
    <h1>Overview by country</h1>
    <app-countries></app-countries>
    <p>
      Show countries with more than
      <select [value]="filterFrom$ | async" (change)="setFilterFrom($event.target)">
        <option>1000</option>
        <option>500</option>
        <option>100</option>
        <option>50</option>
        <option>10</option>
        <option>0</option>
      </select>
      cases.
    </p>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px 16px 100px 16px;
      max-width: 600px;
      margin: 0 auto;
    }

    mat-icon {
      margin-left: auto;
    }

    app-overview {
      display: block;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 16px;
      font-weight: 500;
      margin: 16px 0 0 0;
    }

    p {
      font-size: 12px;
      margin-bottom: 0;
    }

    select {
      background-color: #303030;
      color: white;
      margin: 0 4px;
      padding: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldComponent implements OnInit {

  filterFrom$: Observable<number>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.filterFrom$ = this.store.pipe(
      select(getFilterFrom)
    );
  }

  setFilterFrom(target: any) {
    this.store.dispatch(setFilterFrom({filterFrom: +target.value}));
  }
}
