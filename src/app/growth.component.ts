import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {getHistorical} from './store/core.selectors';
import {map} from 'rxjs/operators';
import {reduceTimeline} from './utils';

@Component({
  selector: 'app-growth',
  template: `
    <mat-card>
      <h1>
        {{countryName || 'World'}} growth rate
        <mat-icon>trending_up</mat-icon>
      </h1>
      <mat-divider></mat-divider>
      <app-chart [data$]="chartData$" [colors]="['#9e9e9e']"></app-chart>
      <p class="source meta">Source: Johns Hopkins University</p>
    </mat-card>
    <mat-card>
      <h1>
        {{countryName || 'World'}} growth rate (relative)
        <mat-icon>trending_up</mat-icon>
      </h1>
      <mat-divider></mat-divider>
      <app-chart [data$]="chartData2$" [colors]="['#9e9e9e']" unit="%"></app-chart>
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
      font-weight: 500;
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: -16px -16px 0 -16px !important;
      padding: 8px 16px 8px 16px;
      min-height: 40px;
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
      map(t => {
        const datas = [];
        const cases = Object.keys(t.cases).map((date, i) => ({
          i,
          date,
          value: t.cases[date]
        }));
        for (const c of cases) {
          if (c.i > 0) {
            datas.push({
              date: new Date(c.date),
              values: [(cases[c.i].value - cases[c.i - 1].value)]
            });
          }
        }
        return datas;
      })
    );

    this.chartData2$ = data$.pipe(
      map(t => {
        const datas = [];
        const cases = Object.keys(t.cases).map((date, i) => ({
          i,
          date,
          value: t.cases[date]
        }));
        for (const c of cases) {
          if (c.i > 0) {
            datas.push({
              date: new Date(c.date),
              values: [(cases[c.i].value - cases[c.i - 1].value) / cases[c.i - 1].value * 100]
            });
          }
        }
        return datas;
      })
    );
  }

}
