import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {Country, DataService} from './data.service';
import {concatMap, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

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
      <mat-drawer #drawer mode="side">
        DRAWER
      </mat-drawer>
      <mat-drawer-content>
        <p class="toggle">
          <mat-slide-toggle (change)="this.normalize$.emit($event.checked)" color="primary">
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
      padding: 0 16px;
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
    h1 {
      flex: 0 0 100px;
      margin: 0;
      padding: 0 8px 0 0;
      font-size: 14px;
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChildren('countries')
  countries: QueryList<ElementRef>;

  normalize$: EventEmitter<boolean> = new EventEmitter();
  normalizeReplay$: Observable<boolean>;
  max$: EventEmitter<number> = new EventEmitter();
  maxReplay$: Observable<number>;

  countries$: Observable<Country[]>;
  dataSets$: Observable<{country: Country; dataSet: {value: number; color: string}[]}[]>;

  sortBys = [
    {value: 'cases', viewValue: 'Number of cases'},
    {value: 'mortality', viewValue: 'Mortality rate'},
    {value: 'percentage', viewValue: 'Cases per million'},
  ];

  observer: IntersectionObserver;

  constructor(
    private dataService: DataService
  ) {
  }

  ngOnInit(): void {
    this.countries$ = this.dataService.getCountries().pipe(
      shareReplay(1),
    );

    this.maxReplay$ = this.max$.pipe(
      shareReplay(1)
    );

    this.maxReplay$.subscribe();

    this.max$.emit(0);

    this.normalizeReplay$ = this.normalize$.pipe(
      shareReplay(1)
    );

    this.normalizeReplay$.subscribe();

    this.normalize$.emit(false);

    this.dataSets$ =
      this.countries$.pipe(
        tap(countries => this.saveToLocalStorage(countries)),
        concatMap(countries => this.normalizeReplay$.pipe(
          switchMap(normalize => this.maxReplay$.pipe(
            map(max => countries.map(country => ({
              country,
              dataSet: this.getDataSet(country, normalize, max)
            })))
          ))
        ))
      );

      /*this.normalize$.asObservable().pipe(
        switchMap(normalize => this.countries$.pipe(
          switchMap(countries => this.max$.pipe(
            map(max => [countries, max])
          )),
          map(([countries, max]) => {
            return (countries as Country[]).map(country => ({
              country,
              dataSet: this.getDataSet(country, normalize, max as number)
            }));
          })
        ))
      );*/

    // setTimeout(() => this.normalize$.emit(false), 1000);
    // setTimeout(() => this.max$.emit(1000000), 1000);

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
      if (country.nativeElement.getAttribute('data-visible') === 'true') {
        return Math.max(m, +country.nativeElement.getAttribute('data-max'));
      }
      return m;
    }, 0);
    console.log('emit', max);
    this.max$.emit(max);
  }

  ngAfterViewInit(): void {
    this.countries.changes.pipe(
      map(list => list.map(c => this.observer.observe(c.nativeElement)))
    ).subscribe();
  }

  getDataSet(country: Country, normalize: boolean, max?: number): {value: number; color: string}[] {
    const set = [
      {value: country.deaths, color: '#212121'},
      {value: country.critical, color: '#ff5722'},
      {value: country.recovered, color: '#4caf50'},
      {value: country.cases - country.deaths - country.critical - country.recovered, color: '#9e9e9e'},
    ];
    return !normalize ? [...set,
      {value: max - country.cases, color: 'transparent'}
    ] : set;
  }

  trackByFn(index: number, item) {
    return item.country.country;
  }

  saveToLocalStorage(countries: Country[]) {
    localStorage.setItem('all', JSON.stringify(countries));
  }
}
