import {ChangeDetectionStrategy, Component, EventEmitter} from '@angular/core';
import {Country, DataService} from './data.service';
import {concatMap, map, shareReplay} from 'rxjs/operators';
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
        <mat-slide-toggle (change)="this.normalize$.emit($event.checked)">
          Normalize
        </mat-slide-toggle>
        <ng-container *ngFor="let data of dataSets$ | async">
          <div class="country">
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
    }
    mat-drawer {
      background-color: #404040;
    }
    mat-drawer-content {
      padding: 16px;
    }
    mat-slide-toggle {
      margin-bottom: 16px;
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
export class AppComponent {

  normalize$: EventEmitter<boolean> = new EventEmitter();
  countries$: Observable<Country[]>;
  dataSets$: Observable<{country: Country; dataSet: {value: number; color: string}[]}[]>;

  constructor(
    private dataService: DataService
  ) {
    this.countries$ = this.dataService.getCountries().pipe(
      shareReplay(1),
    );
    this.dataSets$ =
      this.normalize$.asObservable().pipe(
        concatMap(normalize => this.countries$.pipe(
          map(countries => {
            const max = countries[0].cases;
            return countries.map(country => ({
              country,
              dataSet: this.getDataSet(country, normalize, max)
            }));
          })
        ))
      );

    setTimeout(() => this.normalize$.emit(false));
  }

  getDataSet(country: Country, normalize: boolean, max?: number): {value: number; color: string}[] {
    const set = [
      {value: country.deaths, color: 'black'},
      {value: country.critical, color: 'red'},
      {value: country.recovered, color: 'green'},
      {value: country.cases - country.deaths - country.critical - country.recovered, color: 'grey'},
    ];
    return !normalize ? [...set,
      {value: max - country.cases, color: 'transparent'}
    ] : set;
  }


}
