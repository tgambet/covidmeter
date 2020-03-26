import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {Country, DataService} from './data.service';
import {map} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {select, Store} from "@ngrx/store";
import {fetchCountries, setMaxCases, setNormalize} from "./store/core.actions";
import {getCountries, getMaxCases, getNormalize} from "./store/core.selectors";

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="drawer.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      CovidMeter
    </mat-toolbar>

    <mat-drawer-container class="example-container" hasBackdrop="true">
      <mat-drawer #drawer mode="over" [autoFocus]="false">
        DRAWER
      </mat-drawer>
      <mat-drawer-content>
        <ng-container *ngIf="overview$ | async; let overview">
          <mat-card>
            <h1>Overview</h1>
            <mat-divider></mat-divider>
            <ul class="overview">
              <li>
                <span class="label">Cases</span>
                <span class="value">{{overview.cases | number}}</span>
              </li>
              <li>
                <span class="label recovered">Recovered</span>
                <span class="value">{{overview.recovered | number}}</span>
                <span class="part">({{overview.recovered / overview.cases * 100 | number:'1.0-1'}}%)</span>
              </li>
              <li>
                <span class="label critical">Critical</span>
                <span class="value">{{overview.critical | number}}</span>
                <span class="part">({{overview.critical / overview.cases * 100 | number:'1.0-1'}}%)</span>
              </li>
              <li>
                <span class="label deaths">Deaths</span>
                <span class="value">{{overview.deaths | number}}</span>
                <span class="part">({{overview.deaths / overview.cases * 100 | number:'1.0-1'}}%)</span>
              </li>
            </ul>
            <app-bar [dataSet]="this.getDataSet(overview.cases, overview.deaths, overview.critical, overview.recovered, true)"></app-bar>
            <p class="today">Last 24 hours:</p>
            <ul class="today">
              <li>
                <span class="label">Cases</span>
                <span class="value">{{overview.todayCases | number}}</span>
                <span class="part">(+{{overview.todayCases / (overview.cases - overview.todayCases) * 100 | number:'1.0-1'}}%)</span>
              </li>
              <li>
                <span class="label">Deaths</span>
                <span class="value">{{overview.todayDeaths | number}}</span>
                <span class="part">(+{{overview.todayDeaths / (overview.deaths - overview.todayDeaths) * 100 | number:'1.0-1'}}%)</span>
              </li>
            </ul>
            <button mat-raised-button color="primary" class="update" (click)="updateData()">UPDATE</button>
          </mat-card>
        </ng-container>
        <p class="toggle">
          <mat-slide-toggle (change)="setNormalize($event.checked)" color="primary">
            Normalize
          </mat-slide-toggle>
          <mat-form-field appearance="legacy">
            <mat-label>Sort by</mat-label>
            <mat-select value="cases">
              <mat-option *ngFor="let sortBy of sortBys" [value]="sortBy.value">
                {{sortBy.viewValue}}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </p>
        <ng-container *ngFor="let data of dataSets$ | async; trackBy: trackByFn">
          <div class="country" #countries [attr.data-max]="data.country.cases">
            <h1>{{data.country.country}}</h1>
            <app-bar [dataSet]="data.dataSet"></app-bar>
          </div>
        </ng-container>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }
    button {
      margin-right: 16px;
    }
    mat-drawer-container {
      flex: 1 0 auto;
      overflow: initial;
    }
    mat-drawer {
      background-color: #404040;
    }
    mat-drawer-content {
      padding: 16px;
      overflow: initial;
    }
    .toggle {
      background-color: #303030;
      position: sticky;
      top: 0;
      margin: 0;
      padding: 16px 0 0 0;
    }
    mat-slide-toggle {
      margin-right: 16px;
    }
    .country {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .country h1 {
      flex: 0 0 70px;
      margin: 0;
      padding: 0 8px 0 0;
      font-size: 12px;
      font-weight: 400;
      text-align: right;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    app-bar {
      flex: 1 1 auto;
      display: flex;
    }
    mat-card {
      font-size: 14px;
    }
    mat-card h1 {
      font-size: 16px;
      font-weight: 500;
    }
    .overview {
      list-style: none;
      margin: 0;
      padding: 16px 0;
    }
    .overview li {
      display: flex;
      margin-bottom: 4px;
    }
    .label {
      flex: 0 0 110px;
      text-align: right;
      padding-right: 8px;
      box-sizing: border-box;
    }
    .label.recovered {
      border-left: 8px solid #4caf50;
    }
    .label.critical {
      border-left: 8px solid #ff5722;
    }
    .label.deaths {
      border-left: 8px solid black;
    }
    .value {
      flex: 0 0 60px;
      text-align: right;
      padding-right: 8px;
    }
    .part {
      font-size: 12px;
      opacity: 0.75;
      font-weight: 300;
    }
    p.today {
      margin-bottom: 4px;
    }
    ul.today {
      list-style: none;
      margin: 0;
      padding: 0 0 0 16px;
    }
    ul.today li {
      display: flex;
    }
    ul.today .label {
      flex-basis: 50px;
    }
    ul.today .value {
      flex-basis: 50px;
    }
    .update {
      position: absolute;
      right: 16px;
      bottom: 16px;
      margin-right: 0;
      font-size: 12px;
      font-weight: 500;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChildren('countries')
  countries: QueryList<ElementRef>;

  overview$: Observable<{
    cases: number,
    todayCases: number,
    deaths: number,
    todayDeaths: number,
    recovered: number,
    active: number,
    critical: number
  }>;
  normalize$: Observable<boolean>;
  maxCases$: Observable<number>;
  countries$: Observable<Country[]>;

  dataSets$: Observable<{country: Country; dataSet: {value: number; color: string}[]}[]>;

  sortBys = [
    {value: 'cases', viewValue: 'Number of cases'},
    {value: 'mortality', viewValue: 'Mortality rate'},
    {value: 'percentage', viewValue: 'Cases per million'},
  ];

  observer: IntersectionObserver;

  constructor(
    private dataService: DataService,
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.updateData();

    this.countries$ = this.store.pipe(
      select(getCountries)
    );

    this.normalize$ = this.store.pipe(
      select(getNormalize)
    );

    this.maxCases$ = this.store.pipe(
      select(getMaxCases)
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

    this.dataSets$ =
      combineLatest([this.countries$, this.normalize$, this.maxCases$]).pipe(
        map(([countries, normalize, max]) =>
          countries.slice().sort((a, b) => b.cases - a.cases).map(country => ({
            country,
            dataSet: this.getDataSet(country.cases, country.deaths, country.critical, country.recovered, normalize, max)
          })
        ))
      );

    const options = {
      root: null,
      rootMargin: `-${82 - 17}px 0px 0px 0px`,
      threshold: 1.0
    };

    this.observer = new IntersectionObserver((entries) => this.update(entries), options);
  }

  update(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      entry.target.setAttribute('data-visible', entry.isIntersecting.toString());
    });
    const max = this.countries.reduce((m, country) => {
      return country.nativeElement.getAttribute('data-visible') === 'true' ?
        Math.max(m, +country.nativeElement.getAttribute('data-max')) :
        m;
    }, 0);
    this.store.dispatch(setMaxCases({maxCases: max}))
  }

  ngAfterViewInit(): void {
    // TODO unsubscribe on destroy
    this.countries.changes.pipe(
      map(list => list.map(c => this.observer.observe(c.nativeElement)))
    ).subscribe();
  }

  getDataSet(cases: number, deaths: number, critical: number, recovered: number, normalize: boolean, max?: number): {value: number; color: string}[] {
    const set = [
      {value: deaths, color: 'black'},
      {value: critical, color: '#ff5722'},
      {value: recovered, color: '#4caf50'},
      {value: cases - deaths - critical - recovered, color: '#9e9e9e'},
    ];
    return !normalize ? [...set,
      {value: max - cases, color: 'transparent'}
    ] : set;
  }

  trackByFn(index: number, item) {
    return item.country.country;
  }

  saveToLocalStorage(countries: Country[]) {
    localStorage.setItem('all', JSON.stringify(countries));
  }

  setNormalize(normalize: boolean) {
    this.store.dispatch(setNormalize({normalize}));
  }

  updateData() {
    this.store.dispatch(fetchCountries());
  }
}
