import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {getCountries, getFilterFrom, getHistorical} from './store/core.selectors';
import {filter, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {OverviewData} from './overview.component';
import {setFilterFrom} from './store/core.actions';
import {reduceTimeline, timelineToData} from './utils';

@Component({
  selector: 'app-world',
  template: `
    <app-overview *ngIf="overview$ | async" [data]="overview$ | async" [chartData$]="chartData$">
      <span>World overview</span>
      <mat-icon>language</mat-icon>
    </app-overview>
    <h1>Overview by country</h1>
    <app-countries></app-countries>
    <p>
      Show countries with more than
      <select [value]="filterFrom$ | async" (change)="setFilterFrom($event.target)">
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

  overview$: Observable<OverviewData>;
  chartData$: Observable<{ date: Date, values: number[] }[]>;
  filterFrom$: Observable<number>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.overview$ = this.store.pipe(
      select(getCountries),
      filter(countries => countries.length > 0),
      map(countries => countries.find(c => c.country === 'World')),
    );

    this.filterFrom$ = this.store.pipe(
      select(getFilterFrom)
    );

    this.chartData$ = this.store.pipe(
      select(getHistorical),
      map(reduceTimeline),
      map(timelineToData)
    );
  }

  setFilterFrom(target: any) {
    this.store.dispatch(setFilterFrom({filterFrom: +target.value}));
  }
}
