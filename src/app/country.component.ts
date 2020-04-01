import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {filter, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {select, Store} from '@ngrx/store';
import {getCountryByName} from './store/core.selectors';
import {combineLatest, Observable} from 'rxjs';
import {OverviewData} from './overview.component';
import {Country, DataService} from './data.service';

@Component({
  selector: 'app-country',
  template: `
    <ng-container *ngIf="country$ | async; let country">
      <app-overview *ngIf="overview$ | async; let overview" [data]="overview"
                    [flag]="country.countryInfo.flag" [label]="country.country">
      </app-overview>
    </ng-container>
    <app-chart [data$]="data$" [colors]="['black', 'green', 'grey']" class="mat-elevation-z2"></app-chart>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
      box-sizing: border-box;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }
    app-chart {
      margin-top: 16px;
    }
  `]
})
export class CountryComponent implements OnInit {

  country$: Observable<Country>;
  overview$: Observable<OverviewData>;

  data$: Observable<{date: Date, values: number[]}[]>;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private dataService: DataService
  ) {
  }

  ngOnInit(): void {
    this.country$ = this.route.paramMap.pipe(
      map(params => params.get('name')),
      switchMap(name => this.store.pipe(select(getCountryByName, name))),
      filter(country => !!country),
    );

    this.overview$ = this.country$.pipe(
      map((country: Country) => ({
        cases: country.cases,
        todayCases: country.todayCases,
        deaths: country.deaths,
        todayDeaths: country.todayDeaths,
        recovered: country.recovered,
        active: country.active,
        critical: country.critical,
      }))
    );

    this.data$ = combineLatest([
      this.country$,
      this.dataService.getHistorical().pipe(
        shareReplay(1)
      )
    ]).pipe(
      map(([country, array]) => array.filter(a => a.country === country.country).reduce((result, r) => {
        for (const date in r.timeline.cases) {
          if (r.timeline.cases.hasOwnProperty(date)) {
            result.cases[date] = r.timeline.cases[date] + (result.cases[date] || 0);
            result.deaths[date] = r.timeline.deaths[date] + (result.deaths[date] || 0);
            result.recovered[date] = r.timeline.recovered[date] + (result.recovered[date] || 0);
          }
        }
        return result;
      }, {
        cases: {},
        deaths: {},
        recovered: {}
      })),
      tap(console.log),
      filter(c => !!c),
      map(t => {
        let datas = [];
        for (const key in t.cases) {
          if (t.cases.hasOwnProperty(key)) {
            datas = [
              ...datas,
              {
                date: new Date(key),
                values: [t.deaths[key], t.recovered[key], t.cases[key] - t.deaths[key] - t.recovered[key]]
              }
            ];
          }
        }
        return datas.filter(data => data.values.reduce((total, d) => total + d, 0) > 0);
      })
    );
  }

}
