import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {getDataSet} from './utils';
import {Observable} from 'rxjs';

export interface OverviewData {
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  active: number;
  critical: number;
}

@Component({
  selector: 'app-overview',
  template: `
    <mat-card>
      <h1>
        <ng-content></ng-content>
      </h1>
      <mat-divider></mat-divider>
      <ul class="overview">
        <li>
          <span class="label active">Mild cases</span>
          <span class="value">{{data.cases - data.recovered - data.critical - data.deaths | number}}</span>
          <span class="part">
            ({{(data.cases - data.recovered - data.critical - data.deaths) / data.cases * 100 | number:'1.0-1'}}%)
          </span>
        </li>
        <li>
          <span class="label recovered">Recovered</span>
          <span class="value">{{data.recovered | number}}</span>
          <span class="part">({{data.recovered / data.cases * 100 | number:'1.0-1'}}%)</span>
        </li>
        <li>
          <span class="label critical">Critical</span>
          <span class="value">{{data.critical | number}}</span>
          <span class="part">({{data.critical / data.cases * 100 | number:'1.0-1'}}%)</span>
        </li>
        <li>
          <span class="label deaths">Deaths</span>
          <span class="value">{{data.deaths | number}}</span>
          <span class="part">({{data.deaths / data.cases * 100 | number:'1.0-1'}}%)</span>
        </li>
        <li class="total">
          <span class="label">Total</span>
          <span class="value">{{data.cases | number}}</span>
        </li>
      </ul>
      <h2>Overall progression</h2>
      <app-bar [dataSet]="getData(data)"></app-bar>
      <h2>Timeline</h2>
      <app-chart [data$]="chartData$" [colors]="['black', '#4caf50', '#9e9e9e']"></app-chart>

      <!--      <p class="today">Today:</p>
            <ul class="today">
              <li>
                <span class="label">Cases</span>
                <span class="value">{{data.todayCases | number}}</span>
                <span class="part">(+{{data.todayCases / (data.cases - data.todayCases) * 100 | number:'1.0-1'}}%)</span>
              </li>
              <li>
                <span class="label">Deaths</span>
                <span class="value">{{data.todayDeaths | number}}</span>
                <span class="part">(+{{data.todayDeaths / (data.deaths - data.todayDeaths) * 100 | number:'1.0-1'}}%)</span>
              </li>
            </ul>-->
    </mat-card>
  `,
  styles: [`
    mat-card {
      font-size: 14px;
    }

    h1 {
      font-size: 16px;
      font-weight: 500;
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: -16px -16px 0 -16px !important;
      padding: 8px 16px 8px 16px;
      min-height: 40px;
    }

    h2 {
      font-size: 14px;
      font-weight: 400;
      margin: 0 0 12px 0;
    }

    app-bar {
      display: block;
      margin-bottom: 16px;
    }

    .overview {
      list-style: none;
      margin: 0;
      padding: 16px 0;
    }

    .overview li {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      font-weight: 300;
    }

    .label {
      flex: 0 0 45%;
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
      flex: 0 0 75px;
      text-align: right;
      padding-right: 8px;
    }

    .part {
      font-size: 12px;
      opacity: 0.75;
      font-weight: 300;
    }

    .overview .total {
      margin-top: 8px;
      margin-bottom: 0;
      font-weight: 700;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit {

  @Input()
  data: OverviewData;

  @Input()
  chartData$: Observable<{ date: Date, values: number[] }[]>;

  ngOnInit(): void {
  }

  getData(data: OverviewData) {
    return getDataSet(data.cases, data.deaths, data.critical, data.recovered);
  }
}
