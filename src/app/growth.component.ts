import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {getHistorical} from './store/core.selectors';
import {map} from 'rxjs/operators';
import {reduceTimeline, timelineToGrowthData, timelineToGrowthRateData} from './utils';

@Component({
  selector: 'app-growth',
  template: `
    <mat-card>
      <h1>
        {{countryName || 'World'}} epidemic progression
        <mat-icon>trending_up</mat-icon>
      </h1>
      <mat-divider></mat-divider>
      <h2 class="first">
        Cases growth per day
      </h2>
      <app-chart [data$]="chartData$" [colors]="['#9e9e9e']"></app-chart>
      <mat-divider></mat-divider>
      <h2>
        Deaths growth per day
      </h2>
      <app-chart [data$]="chartData3$" [colors]="['rgba(0,0,0,0.75)']"></app-chart>
      <mat-divider></mat-divider>
      <h2>
        Recovered growth per day
      </h2>
      <app-chart [data$]="chartData5$" [colors]="['#4caf50']"></app-chart>
<!--      <mat-divider></mat-divider>-->

<!--      <h2>-->
<!--        Cases growth rate per day-->
<!--      </h2>-->
<!--      <app-chart [data$]="chartData2$" [colors]="['#9e9e9e']" unit="%"></app-chart>-->
<!--      <mat-divider></mat-divider>-->
<!--      <h2>-->
<!--        Deaths growth rate per day-->
<!--      </h2>-->
<!--      <app-chart [data$]="chartData4$" [colors]="['rgba(0,0,0,0.75)']" unit="%"></app-chart>-->
<!--      <mat-divider></mat-divider>-->
<!--      <h2>-->
<!--        Recovered growth rate per day-->
<!--      </h2>-->
<!--      <app-chart [data$]="chartData6$" [colors]="['#4caf50']" unit="%"></app-chart>-->
      <p class="source meta">Source: Johns Hopkins University</p>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    mat-card {
      font-size: 14px;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 16px;
      font-weight: 700;
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
      margin-top: 32px;
    }

    h2.first {
      margin-top: 16px;
    }

    mat-icon {
      margin-left: auto;
    }

    app-chart {
      margin: 12px 0;
    }

    .meta {
      margin: 0;
      font-size: 12px;
      font-weight: 300;
      color: #aaa;
      text-align: right;
    }
  `]
})
export class GrowthComponent implements OnInit {

  @Input()
  countryName: string;

  chartData$: Observable<{ date: Date, values: number[] }[]>;
  chartData2$: Observable<{ date: Date, values: number[] }[]>;
  chartData3$: Observable<{ date: Date, values: number[] }[]>;
  chartData4$: Observable<{ date: Date, values: number[] }[]>;
  chartData5$: Observable<{ date: Date, values: number[] }[]>;
  chartData6$: Observable<{ date: Date, values: number[] }[]>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    const data$ = this.store.pipe(
      select(getHistorical),
      map(h => h.filter(a => this.countryName ? a.country === this.countryName : true)),
      map(reduceTimeline),
    );

    this.chartData$ = data$.pipe(
      map(t => timelineToGrowthData(t, 'cases'))
    );

    this.chartData2$ = data$.pipe(
      map(t => timelineToGrowthRateData(t, 'cases'))
    );

    this.chartData3$ = data$.pipe(
      map(t => timelineToGrowthData(t, 'deaths'))
    );

    this.chartData4$ = data$.pipe(
      map(t => timelineToGrowthRateData(t, 'deaths'))
    );

    this.chartData5$ = data$.pipe(
      map(t => timelineToGrowthData(t, 'recovered'))
    );

    this.chartData6$ = data$.pipe(
      map(t => timelineToGrowthRateData(t, 'recovered'))
    );
  }

}
