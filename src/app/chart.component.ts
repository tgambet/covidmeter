import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import {combineLatest, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-chart',
  template: `
    <svg class="chart" [attr.height]="graphHeight + margin.top + margin.bottom" #svg>
      <g class="graph" [attr.transform]="'translate(' + margin.left + ', ' + margin.top + ')'">
        <g class="x axis" [attr.transform]="'translate(0, ' + graphHeight + ')'">
          <g class="tick" *ngFor="let tick of xTicks$ | async"
             [attr.transform]="'translate(' + tick.x + ', 0)'">
            <line stroke="currentColor" y2="6"></line>
            <text fill="currentColor" x="-4" y="9" text-anchor="end">{{tick.label}}</text>
          </g>
        </g>
        <g class="y axis" *ngIf="width$ | async; let width">
          <g class="tick" *ngFor="let tick of yTicks$ | async"
             [attr.transform]="'translate(0, ' + tick.y + ')'">
            <line stroke="currentColor" [attr.x2]="width"></line>
            <text fill="currentColor" [attr.x]="width + 3" dy="0.32em">{{tick.label}}</text>
          </g>
        </g>
        <rect *ngFor="let rect of rects$ | async"
              [attr.fill]="rect.color"
              [attr.x]="rect.x" [attr.y]="rect.y"
              [attr.width]="rect.width" [attr.height]="rect.height"></rect>
      </g>
    </svg>
  `,
  styles: [`
    :host {
      display: block;
    }

    .chart {
      width: 100%;
    }

    .axis {
      position: relative;
    }

    .axis text {
      font-size: 10px;
      line-height: 1;
      shape-rendering: crispEdges;
    }

    .x.axis text {
      transform: rotate(-60deg);
      transform-origin: 0 5px;
    }

    .tick line {
      shape-rendering: crispEdges;
      color: #555;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit {

  @Input() data$: Observable<{ date: Date, values: number[] }[]>;
  @Input() colors: string[];

  widthEmitter: EventEmitter<number> = new EventEmitter<number>();
  width$: Observable<number> = this.widthEmitter.pipe(startWith(313));

  xTicks$: Observable<{ label: string, x: number }[]>;
  yTicks$: Observable<{ label: string, y: number }[]>;

  xScale$: Observable<d3.ScaleTime<number, number>>;
  yScale$: Observable<d3.ScaleLinear<number, number>>;

  rects$: Observable<{ x: number, y: number, width: number, height: number, color: string }[]>;

  margin = {top: 10, right: 25, bottom: 35, left: 10};
  graphHeight = 140;

  @ViewChild('svg', {static: true})
  private svg: ElementRef;

  constructor() {
  }

  formatDate(date: Date): string {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    return (m <= 9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d);
  }

  ngOnInit(): void {

    this.xScale$ = combineLatest([this.width$, this.data$]).pipe(
      map(([width, data]) => {
        const dates = data.reduce((p, c) => [...p, c.date], []);
        return d3.scaleTime()
          .domain(d3.extent(dates))
          .range([width / data.length / 2, width - width / data.length / 2 - 2]);
      })
    );

    this.yScale$ = this.data$.pipe(
      map((data) => {
        const totals: number[] = data.map(d => d.values.reduce((total, v) => total + v, 0));
        return d3.scaleLinear()
          .domain([0, d3.max(totals)])
          .range([0, this.graphHeight])
          .nice();
      })
    );

    this.xTicks$ = this.xScale$.pipe(
      map(scale => scale.ticks(10)
        .map(date => ({
          label: this.formatDate(date),
          x: scale(date)
        }))
      )
    );

    this.yTicks$ = this.yScale$.pipe(
      map(scale => scale.ticks()
        .map(value => ({
          label: d3.format('.2s')(value),
          y: this.graphHeight - scale(value)
        }))
      ),
    );

    this.rects$ = combineLatest([this.data$, this.width$, this.xScale$, this.yScale$]).pipe(
      map(([data, width, xScale, yScale]) =>
        data.map(d => {
          let offset = 0;
          return d.values.map((v, i) => {
            const rect = {
              color: this.colors[i],
              width: width / data.length - 1,
              height: yScale(v),
              x: xScale(d.date) - width / data.length / 2,
              y: this.graphHeight - yScale(v) - offset
            };
            offset += rect.height;
            return rect;
          });
        }).reduce((a, r) => [...a, ...r], [])
      )
    );

    this.updateWidth();
  }

  @HostListener('window:resize')
  updateWidth() {
    requestAnimationFrame(() => {
      this.widthEmitter.emit(
        this.svg.nativeElement.clientWidth - this.margin.left - this.margin.right
      );
    });
  }

}
