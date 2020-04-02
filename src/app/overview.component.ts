import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {getDataSet} from './utils';

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
          <span class="label">Cases</span>
          <span class="value">{{data.cases | number}}</span>
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
      </ul>
      <app-bar [dataSet]="getData(data)"></app-bar>
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

    .overview {
      list-style: none;
      margin: 0;
      padding: 16px 0;
    }

    .overview li {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }

    .label {
      flex: 0 0 45%;
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
      padding: 0;
    }

    ul.today li {
      display: flex;
      margin-bottom: 4px;
    }

    ul.today li:last-child {
      margin-bottom: 0;
    }

    ul.today .label {
      flex-basis: 75px;
    }

    ul.today .value {
      flex-basis: 50px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit {

  @Input()
  data: OverviewData;

  constructor() {
  }

  ngOnInit(): void {
  }

  getData(data: OverviewData) {
    return getDataSet(data.cases, data.deaths, data.critical, data.recovered);
  }
}
