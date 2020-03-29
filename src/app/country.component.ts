import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {filter, map, switchMap} from 'rxjs/operators';
import {select, Store} from '@ngrx/store';
import {getCountryByName} from './store/core.selectors';
import {Observable} from 'rxjs';
import {OverviewData} from './overview.component';
import {Country} from './data.service';

@Component({
  selector: 'app-country',
  template: `
    <ng-container *ngIf="country$ | async; let country">
        <app-overview *ngIf="overview$ | async; let overview" [data]="overview"
                      [flag]="country.countryInfo.flag" [label]="country.country">
        </app-overview>
    </ng-container>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }`
  ]
})
export class CountryComponent implements OnInit {

  country$: Observable<Country>;
  overview$: Observable<OverviewData>;

  constructor(
    private route: ActivatedRoute,
    private store: Store
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
  }

}
