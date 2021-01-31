import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {getDataSet} from './utils';
import {combineLatest, Observable} from 'rxjs';
import {OverviewData} from './data.service';
import {filter, map} from 'rxjs/operators';
import {select, Store} from '@ngrx/store';
import {getCountryByName, getWorld, getYesterdayCountryByName, getYesterdayWorld} from './store/core.selectors';

@Component({
  selector: 'app-overview',
  template: `
    <mat-card>
      <h1>
        <ng-content></ng-content>
      </h1>
      <mat-divider></mat-divider>
      <ng-container *ngIf="data$ | async; let d">
          <ul class="overview">
            <li>
              <span class="label deaths">Deaths</span>
              <span class="value">{{d.today.deaths | number}}</span>
              <ng-container *ngIf="d.today.deaths - d.yesterday.deaths; let diff;">
                <span class="part">+{{diff | number:'1.0-1'}}</span>
              </ng-container>
            </li>
            <li>
              <span class="label critical">Critical</span>
              <span class="value">{{d.today.critical | number}}</span>
              <ng-container *ngIf="d.today.critical - d.yesterday.critical; let diff;">
                <span class="part">{{diff > 0 ? '+' : ''}}{{diff | number:'1.0-1'}}</span>
              </ng-container>
            </li>
            <li>
              <span class="label recovered">Recovered</span>
              <span class="value">{{d.today.recovered | number}}</span>
              <ng-container *ngIf="d.today.recovered - d.yesterday.recovered; let diff;">
                <span class="part">+{{diff | number:'1.0-1'}}</span>
              </ng-container>
            </li>
            <li>
              <span class="label active">Other cases</span>
              <span class="value">{{d.today.active - d.today.critical | number}}</span>
              <ng-container *ngIf="(d.today.active - d.today.critical) - (d.yesterday.active - d.yesterday.critical); let diff;">
                <span class="part">{{diff > 0 ? '+' : ''}}{{diff | number:'1.0-1'}}</span>
              </ng-container>
            </li>
            <li class="total">
              <span class="label">Total</span>
              <span class="value">{{d.today.cases | number}}</span>
              <ng-container *ngIf="d.today.cases - d.yesterday.cases; let diff;">
                <span class="part">+{{diff | number:'1.0-1'}}</span>
              </ng-container>
            </li>
          </ul>
          <app-bar [dataSet]="getData(d.today.cases, d.today.deaths, d.today.critical, d.today.recovered)"></app-bar>
          <p class="source meta">Source: Worldometer</p>
          <p class="updated meta">Last updated: {{d.today.updated | date:'short'}}</p>
      </ng-container>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    mat-card {
      font-size: 14px;
    }

    h1 {
      font-size: 16px;
      font-weight: 700;
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: -16px -16px 0 -16px !important;
      padding: 8px 16px;
      min-height: 40px;
    }

    h2 {
      font-size: 14px;
      font-weight: 400;
      margin: 24px 0 12px 0;
    }

    app-bar {
      display: block;
      margin-bottom: 12px;
    }

    .overview {
      list-style: none;
      margin: 16px 0;
      padding: 0;
    }

    .overview li {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      font-weight: 300;
    }

    .label {
      flex: 0 0 40%;
      text-align: right;
      padding-right: 8px;
      box-sizing: border-box;
    }

    .label {
      border-right: 8px solid transparent;
    }

    .label.active {
      border-right: 8px solid #9E9E9E;
    }

    .label.recovered {
      border-right: 8px solid #4caf50;
    }

    .label.critical {
      border-right: 8px solid #ff5722;
    }

    .label.deaths {
      border-right: 8px solid black;
    }

    .value {
      flex: 0 0 100px;
      text-align: right;
      padding-right: 8px;
    }

    .part {
      flex: 0 1 60px;
      text-align: right;
      font-size: 12px;
      opacity: 0.75;
      font-weight: 300;
    }

    .overview .total {
      margin-top: 16px;
      margin-bottom: 0;
      font-weight: 700;
    }

    .meta {
      margin: 0;
      font-size: 12px;
      font-weight: 300;
      color: #aaa;
      text-align: right;
    }

    .source {
      margin-bottom: 4px;
    }

    app-chart {
      margin-bottom: 12px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit {

  @Input()
  countryName?: string;

  data$: Observable<{ today: OverviewData, yesterday: OverviewData }>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    const country$ = this.countryName ? this.store.pipe(
      select(getCountryByName, this.countryName),
      filter(c => !!c)
    ) : this.store.pipe(select(getWorld));

    const yesterday$ = this.countryName ?  this.store.pipe(
      select(getYesterdayCountryByName, this.countryName)
    ) : this.store.pipe(select(getYesterdayWorld));

    this.data$ = combineLatest([country$, yesterday$]).pipe(
      map(([today, yesterday]) => ({today, yesterday: yesterday ? yesterday : today}))
    );
  }

  getData(cases, deaths, critical, recovered) {
    return getDataSet(cases, deaths, critical, recovered);
  }
}
