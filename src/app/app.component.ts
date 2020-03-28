import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Country, DataService} from './data.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {select, Store} from "@ngrx/store";
import {fetchCountries} from "./store/core.actions";
import {getCountries} from "./store/core.selectors";
import {OverviewData} from "./overview.component";

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar>
      CovidMeter <!--<mat-icon>home</mat-icon> <mat-icon>map</mat-icon>-->
    </mat-toolbar>
    <main>
      <app-overview [data]="overview$ | async"></app-overview>
      <app-countries></app-countries>
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

  overview$: Observable<OverviewData>;
  countries$: Observable<Country[]>;

  constructor(
    private dataService: DataService,
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.store.dispatch(fetchCountries());

    this.countries$ = this.store.pipe(
      select(getCountries)
    );

    this.overview$ = this.countries$.pipe(
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
  }
}
