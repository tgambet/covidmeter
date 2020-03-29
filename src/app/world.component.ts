import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {getCountries, getFilterFrom} from './store/core.selectors';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {OverviewData} from './overview.component';
import {setFilterFrom} from './store/core.actions';

@Component({
  selector: 'app-world',
  template: `
    <app-overview [data]="overview$ | async" label="World"></app-overview>
    <h1>Overview by country</h1>
    <p>
      Show countries with
      <select [value]="filterFrom$ | async" (change)="setFilterFrom($event.target)">
        <option>100</option>
        <option>50</option>
        <option>10</option>
        <option>0</option>
      </select>
      or more deaths.
    </p>
    <app-countries></app-countries>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      font-size: 16px;
      font-weight: 500;
      margin: 16px 0 0 0;
    }
    p {
      font-size: 14px;
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

  from = 10;

  overview$: Observable<OverviewData>;
  filterFrom$: Observable<number>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.overview$ = this.store.pipe(
      select(getCountries),
      map(countries => countries.reduce((result, country) => ({
        cases: result.cases + country.cases,
        todayCases: result.todayCases + country.todayCases,
        deaths: result.deaths + country.deaths,
        todayDeaths: result.todayDeaths + country.todayDeaths,
        recovered: result.recovered + country.recovered,
        active: result.active + country.active,
        critical: result.critical + country.critical
      }), {cases: 0, todayCases: 0, deaths: 0, todayDeaths: 0, recovered: 0, active: 0, critical: 0}))
    );

    this.filterFrom$ = this.store.pipe(
      select(getFilterFrom)
    );
  }

  setFilterFrom(target: any) {
    this.store.dispatch(setFilterFrom({filterFrom: +target.value}));
  }
}
