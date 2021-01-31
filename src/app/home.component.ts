import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {getFilterFrom} from './store/core.selectors';
import {Observable} from 'rxjs';
import {setFilterFrom} from './store/core.actions';

@Component({
  selector: 'app-home',
  template: `
    <app-overview>
      <span>World overview</span>
      <mat-icon>language</mat-icon>
    </app-overview>
    <h1>Overview by country <span>(click on a country for details)</span></h1>
    <app-countries></app-countries>
    <p>
      Show countries with more than
      <select [value]="filterFrom$ | async" (change)="setFilterFrom($event.target)">
        <option>100000</option>
        <option>10000</option>
        <option>1000</option>
        <option>0</option>
      </select>
      cases.
    </p>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px 16px 100px 16px;
      width: 100%;
      box-sizing: border-box;
      max-width: 600px;
      margin: 0 auto;
    }

    mat-icon {
      margin-left: auto;
    }

    app-overview {
      margin-bottom: 16px;
    }

    h1 {
      font-size: 16px;
      font-weight: 700;
      margin: 16px 0 0 0;
    }

    h1 span {
      font-size: 12px;
      color: #aaa;
      font-weight: 400;
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
export class HomeComponent implements OnInit {

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
