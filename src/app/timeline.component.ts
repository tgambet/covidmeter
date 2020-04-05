import {Component, Input, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {getHistorical} from './store/core.selectors';
import {map} from 'rxjs/operators';
import {reduceTimeline, timelineToData} from './utils';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-timeline',
  template: `
    <mat-card>
      <h1>
        {{countryName || 'World'}} timeline
        <mat-icon>timeline</mat-icon>
      </h1>
      <mat-divider></mat-divider>
      <app-chart [data$]="chartData$" [colors]="['black', '#4caf50', '#9e9e9e']"></app-chart>
      <p class="source meta">Source: Johns Hopkins University</p>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
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
      margin-top: 12px;
    }

     .meta {
       margin: 12px 0 0;
       font-size: 12px;
       font-weight: 300;
       color: #aaa;
       text-align: right;
     }
  `]
})
export class TimelineComponent implements OnInit {

  @Input()
  countryName: string;

  chartData$: Observable<{ date: Date, values: number[] }[]>;

  constructor(
    private store: Store
  ) { }

  ngOnInit(): void {
    this.chartData$ = this.store.pipe(
      select(getHistorical),
      map(h => h.filter(a => this.countryName ? a.country === this.countryName : true)),
      map(reduceTimeline),
      map(timelineToData)
    );
  }

}
