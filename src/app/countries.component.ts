import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {Country} from './data.service';
import {select, Store} from '@ngrx/store';
import {getCountries, getFilterFrom, getMaxCases, getNormalize, getSortBy} from './store/core.selectors';
import {setMaxCases, setNormalize, setSortBy} from './store/core.actions';
import {map} from 'rxjs/operators';
import {getDataSet} from './utils';

@Component({
  selector: 'app-countries',
  template: `
    <div class="controls">
      <ng-container *ngIf="normalize$ | async; let normalize">
        <button mat-mini-fab (click)="setNormalize(!normalize)" color="primary">
          <mat-icon>format_align_left</mat-icon>
        </button>
      </ng-container>
      <ng-container *ngIf="(normalize$ | async) === false; let normalize">
        <button mat-mini-fab (click)="setNormalize(normalize)" color="primary">
          <mat-icon>format_align_justify</mat-icon>
        </button>
      </ng-container>
      <mat-form-field appearance="standard" class="sort">
        <mat-label>Sort by</mat-label>
        <mat-select [value]="sortBy$ | async" (selectionChange)="setSortBy($event.value)">
          <mat-option *ngFor="let sortBy of sortBys" [value]="sortBy.value">
            {{sortBy.viewValue}}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="standard" class="search">
        <mat-label>Search</mat-label>
        <input matInput placeholder="Search by location" (keyup)="search($event.target)">
      </mat-form-field>
    </div>
    <ng-container *ngFor="let data of dataSets$ | async; trackBy: trackByFn">
      <div class="country" #countries [attr.data-max]="data.country.cases" [attr.data-name]="data.country.country">
        <h1><a [routerLink]="['country', data.country.country]">{{data.country.country}}</a></h1>
        <app-bar [dataSet]="data.dataSet"></app-bar>
      </div>
    </ng-container>
  `,
  styles: [`
    .controls {
      background-color: #303030;
      position: sticky;
      top: 0;
      margin: 0;
      padding: 8px 0 0 0;
      display: flex;
      align-items: center;
      font-size: 14px;
    }
    .controls button {
    }
    .controls mat-form-field {
      flex: 0 1 auto;
      max-width: calc(50vw - 20px - 16px);
    }
    .sort {
      padding: 0 12px;
      box-sizing: border-box;
    }
    .controls .search {
      padding-right: 0;
    }
    .country {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
    .country h1 {
      flex: 0 0 80px;
      margin: 0;
      padding: 0 8px 0 0;
      font-size: 12px;
      line-height: 1;
      font-weight: 400;
      text-align: right;
      overflow: hidden;
    }
    h1 a {
      display: block;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    app-bar {
      flex: 1 1 auto;
      display: flex;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountriesComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('countries')
  countries: QueryList<ElementRef>;

  normalize$: Observable<boolean>;
  maxCases$: Observable<number>;
  sortBy$: Observable<string>;
  countries$: Observable<Country[]>;
  dataSets$: Observable<{country: Country; dataSet: {value: number; color: string}[]}[]>;

  sortBys = [
    {value: 'cases', viewValue: 'Number of cases'},
    {value: 'deaths', viewValue: 'Number of deaths'},
    {value: 'casesPerOneMillion', viewValue: 'Cases per million'},
    {value: 'deathsPerOneMillion', viewValue: 'Deaths per million'},
    {value: 'mortality', viewValue: 'Mortality rate'},
  ];

  observer: IntersectionObserver;

  subscription: Subscription = new Subscription();

  constructor(
    private store: Store
  ) { }

  ngOnInit(): void {
    this.countries$ = this.store.pipe(
      select(getCountries)
    );

    this.normalize$ = this.store.pipe(
      select(getNormalize)
    );

    this.maxCases$ = this.store.pipe(
      select(getMaxCases)
    );

    this.sortBy$ = this.store.pipe(
      select(getSortBy)
    );

    const filterFrom$ = this.store.pipe(
      select(getFilterFrom)
    );

    this.dataSets$ =
      combineLatest([this.countries$, this.normalize$, this.maxCases$, this.sortBy$, filterFrom$]).pipe(
        map(([countries, normalize, max, sortBy, filterFrom]) =>
          countries
            .filter(country => country.deaths >= filterFrom)
            .slice()
            .sort((a, b) => {
              switch (sortBy) {
                case 'cases':
                  return b.cases - a.cases;
                case 'deaths':
                  return b.deaths - a.deaths;
                case 'mortality':
                  return (b.deaths / b.cases) - (a.deaths / a.cases);
                case 'casesPerOneMillion':
                  return b.casesPerOneMillion - a.casesPerOneMillion;
                case 'deathsPerOneMillion':
                  return b.deathsPerOneMillion - a.deathsPerOneMillion;
              }
            })
            .map(country => ({
                country,
                dataSet: this.getDataSet(country, normalize, max)
              })
            )
        )
      );

    const options = {
      root: null,
      rootMargin: `-${78 - 15}px 0px 0px 0px`,
      threshold: 1.0
    };

    this.observer = new IntersectionObserver((entries) => this.update(entries), options);
  }

  ngAfterViewInit(): void {
    this.subscription.add(
      this.countries.changes.pipe(
        map(list => list.map(c => this.observer.observe(c.nativeElement)))
      ).subscribe()
    );

    this.countries.notifyOnChanges();
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
    this.subscription.unsubscribe();
  }

  update(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      entry.target.setAttribute('data-visible', entry.isIntersecting.toString());
    });
    this.updateMaxCases();
  }

  updateMaxCases(): void {
    const max = this.countries.reduce((m, country) => {
      return country.nativeElement.getAttribute('data-visible') !== 'false' ?
        Math.max(m, +country.nativeElement.getAttribute('data-max')) :
        m;
    }, 0);
    this.store.dispatch(setMaxCases({maxCases: max}));
  }

  trackByFn(index: number, item) {
    return item.country.country;
  }

  setNormalize(normalize: boolean) {
    this.store.dispatch(setNormalize({normalize}));
  }

  setSortBy(sortBy: string) {
    this.store.dispatch(setSortBy({sortBy}));
  }

  search(target) {
    const value = target.value;

    const first = this.countries.find(
      element => element.nativeElement
        .getAttribute('data-name')
        .toLowerCase()
        .includes(value.toLowerCase())
    );

    if (first) {
      window.scrollTo({top: first.nativeElement.offsetTop - 78, behavior: 'smooth'});
    }
  }

  getDataSet(country: Country, normalize: boolean, max: number) {
    return getDataSet(country.cases, country.deaths, country.critical, country.recovered, normalize, max);
  }
}
