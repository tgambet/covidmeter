import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {Country} from './data.service';
import {select, Store} from '@ngrx/store';
import {getCountries, getFilterFrom, getMaxCases, getNormalize, getSortBy} from './store/core.selectors';
import {setMaxCases, setNormalize, setSortBy} from './store/core.actions';
import {map} from 'rxjs/operators';
import {getDataSet} from './utils';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

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
      <mat-form-field appearance="standard" class="search" floatLabel="always">
        <mat-label>Search</mat-label>
        <input matInput placeholder="Search by location" (keyup)="search($event.target)">
      </mat-form-field>
    </div>
    <ng-container *ngFor="let data of dataSets$ | async; trackBy: trackByFn">
      <ng-template #dialog>
        <app-overview [data]="data.country">
          <button mat-icon-button (click)="closeDialog()">
            <mat-icon>close</mat-icon>
          </button>
          <span>{{data.country.country}}</span>
          <a class="country-link" [routerLink]="['country', data.country.country]" (click)="closeDialog()">
            (show details)
          </a>
          <img [src]="data.country.countryInfo.flag" alt="flag"/>
        </app-overview>
      </ng-template>
      <div class="country" #countries
           [attr.data-max]="data.country.cases" [attr.data-name]="data.country.country"
           (click)="openDialog(dialog)">
        <h1>{{data.country.country}}</h1>
        <app-bar [dataSet]="data.dataSet"></app-bar>
      </div>
    </ng-container>

    <button mat-mini-fab class="top" color="primary" (click)="backToTop()" [class.visible]="showBackToTop">
      <mat-icon>arrow_upward</mat-icon>
    </button>
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
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-decoration: underline;
    }
    app-bar {
      flex: 1 1 auto;
      display: flex;
    }
    .top {
      position: fixed;
      bottom: 8px;
      right: 8px;
      opacity: 0;
      transition: opacity 300ms ease;
    }
    .top.visible {
      opacity: 1;
    }
    app-overview img {
      display: inline-block;
      margin-left: auto;
      height: 24px;
      overflow: hidden;
    }
    app-overview button {
      position: relative;
      left: -8px;
    }
    .country-link {
      margin-left: 8px;
      font-size: 12px;
      color: #aaa;
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

  showBackToTop = false;

  private dialogRef: MatDialogRef<any>;

  @HostListener('window:scroll')
  resize() {
    this.showBackToTop = window.scrollY !== 0;
  }

  constructor(
    private store: Store,
    private dialog: MatDialog
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

  openDialog(dialogRef: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(dialogRef, {
      width: '100%',
      maxWidth: '456px',
    });
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  backToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
}
