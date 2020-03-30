import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {fetchCountries} from './store/core.actions';
import {Store} from '@ngrx/store';
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
          <span>{{label}} overview</span>
          <img [src]="flag" *ngIf="flag" alt="flag"/>
          <mat-icon *ngIf="!flag">language</mat-icon>
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
        <p class="today">Today:</p>
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
        </ul>
        <button mat-raised-button color="primary" class="update" (click)="updateData()">UPDATE</button>
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
    }
    h1 img {
      display: inline-block;
      margin-left: auto;
      height: 24px;
      overflow: hidden;
    }
    h1 mat-icon {
      margin-left: auto;
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
export class OverviewComponent implements OnInit {

  @Input()
  label: string;

  @Input()
  flag: string;

  @Input()
  data: OverviewData;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
  }

  updateData() {
    this.store.dispatch(fetchCountries());
  }

  getData(data: OverviewData) {
    return getDataSet(data.cases, data.deaths, data.critical, data.recovered, true);
  }
}
