import {ChangeDetectionStrategy, Component, EventEmitter, HostBinding, OnDestroy, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {select, Store} from '@ngrx/store';
import {getMapDataType, getMapScale} from './store/core.selectors';
import {map, shareReplay, tap} from 'rxjs/operators';
import * as d3 from 'd3';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {setMapDataType, setMapScale} from './store/core.actions';
import {DataService} from './data.service';

@Component({
  selector: 'app-france',
  template: `
    <div id="france"></div>
    <div class="legend mat-elevation-z6">
      <ng-container *ngIf="legend$ | async; let legend">
        <h2>{{legend.title}}</h2>
        <div class="colors"></div>
        <div class="legend-labels">
            <span class="legend-label" *ngFor="let label of legend.labels" [style.bottom]="label.bottom - 5 + 'px'">
              -&nbsp;&nbsp;{{label.label}}
            </span>
        </div>
      </ng-container>
    </div>
    <div class="details mat-elevation-z6" *ngIf="details$ | async; let d">
      <h3>{{d.nom}} ({{d.data.dep}})</h3>
      <ul class="overview">
        <li>
          <span class="label deaths">Deaths</span>
          <span class="value">{{d.data.dc | number}}</span>
        </li>
        <li>
          <span class="label critical">Critical</span>
          <span class="value">{{d.data.rea | number}}</span>
        </li>
        <li>
          <span class="label recovered">Recovered</span>
          <span class="value">{{d.data.rad | number}}</span>
        </li>
        <li>
          <span class="label active">Others</span>
          <span class="value">{{d.data.hosp | number}}</span>
        </li>
        <li class="total">
          <span class="label">Total</span>
          <span class="value">{{+d.data.dc + +d.data.rea + +d.data.rad + +d.data.hosp | number}}</span>
        </li>
      </ul>
      <app-bar [dataSet]="[
        {value: +d.data.dc, color: 'black'},
        {value: +d.data.rea, color: '#ff5722'},
        {value: +d.data.rad, color: '#4caf50'},
        {value: +d.data.hosp, color: '#9E9E9E'}
      ]"></app-bar>
    </div>
    <div class="zoom mat-elevation-z6">
      <button mat-icon-button (click)="toggleFullScreen()">
        <mat-icon>{{fullScreen ? 'fullscreen_exit' : 'fullscreen'}}</mat-icon>
      </button>
      <button mat-icon-button (click)="map.zoomIn()">
        <mat-icon>add</mat-icon>
      </button>
      <button mat-icon-button (click)="map.zoomOut()">
        <mat-icon>remove</mat-icon>
      </button>
    </div>
    <mat-accordion class="controls mat-elevation-z6">
      <mat-expansion-panel #panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Data
          </mat-panel-title>
        </mat-expansion-panel-header>
        <mat-form-field>
          <mat-label>Data</mat-label>
          <mat-select [value]="dataType$ | async" (valueChange)="setDataType($event); panel.close()">
            <mat-option *ngFor="let dt of dataTypes" [value]="dt.value">
              {{dt.title}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Scale</mat-label>
          <mat-select [value]="scale$ | async" (valueChange)="setScale($event); panel.close()">
            <mat-option value="log">Logarithmic</mat-option>
            <mat-option value="linear">Linear</mat-option>
          </mat-select>
        </mat-form-field>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }

    :host.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    #france {
      width: 100%;
      height: calc(100vh - 56px);
    }

    :host.fullscreen #france {
      height: 100%;
    }

    .legend {
      width: 60px;
      position: absolute;
      bottom: 8px;
      left: 8px;
      background-color: #303030;
      padding: 34px 8px 12px 8px;
      border-radius: 4px;
      z-index: 400;
      display: flex;
    }

    .details {
      width: 150px;
      position: absolute;
      bottom: 8px;
      left: 92px;
      background-color: #303030;
      padding: 8px;
      border-radius: 4px;
      z-index: 400;
      display: flex;
      flex-direction: column;
    }

    .details h3 {
      font-size: 14px;
      margin: 0 0 8px 0;
      text-align: center;
    }

    .zoom {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background-color: #303030;
      border-radius: 4px;
      z-index: 400;
      display: flex;
      flex-direction: column;
    }

    h2 {
      position: absolute;
      top: 0;
      font-size: 12px;
      font-weight: 400;
    }

    .colors {
      height: 155px;
      width: 16px;
      background: linear-gradient(to top, #0ff, #0ff 5px, #0091ea 5px, #d50000);
    }

    .legend-labels {
      height: 150px;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .legend-label {
      font-size: 10px;
      line-height: 12px;
      position: absolute;
    }

    .controls {
      font-size: 12px;
      position: absolute;
      top: 8px;
      right: 8px;
      background-color: #303030;
      border-radius: 4px;
      z-index: 401;
      display: flex;
      max-width: 240px;
    }

    mat-panel-title {
      font-size: 14px;
    }

    mat-form-field {
      width: 100%;
    }

    .overview {
      list-style: none;
      padding: 0;
      margin: 0 0 8px 0;
      font-size: 12px;
    }

    .overview li {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      font-weight: 300;
    }

    .label {
      flex: 0 0 55%;
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
      flex: 0 0 50px;
      text-align: right;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FranceComponent implements OnInit, OnDestroy {

  @HostBinding('class.fullscreen')
  fullScreen = false;

  dataTypes: any[] = [
    {title: 'Number of cases', value: 'cases', short: 'Cases'},
    {title: 'Number of deaths', value: 'deaths', short: 'Deaths'},
  ];

  max$: Observable<{
    cases: number,
    deaths: number,
  }>;
  legend$: Observable<{ title: string, labels: { label: string; bottom: number }[] }>;
  dataType$: Observable<string>;
  scale$: Observable<'linear' | 'log'>;

  detailsEE: EventEmitter<any> = new EventEmitter<any>();
  details$: Observable<any>;

  map: L.Map;
  geoJson: L.GeoJSON;

  subscription: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private store: Store
  ) {
  }

  ngOnInit(): void {

    this.details$ = this.detailsEE.asObservable();

    const franceData$ = this.dataService.getFranceData().pipe(
      map((file: string) => {
        const [cols, ...lines] = file.split('\n')
          .map(s => s.trim())
          .map(s => s.replace(/"/g, ''));
        const data = lines.map(line => {
          const columns = cols.split(';');
          const cells = line.split(';');
          const result = {};
          cells.forEach((cell, index) => result[columns[index]] = cell);
          return result;
        }).filter((datum: any) => datum.sexe === '0');

        data.forEach((datum: any) => {
          datum.jour = new Date(datum.jour);
          datum.hosp = +datum.hosp;
          datum.dc = +datum.dc;
          datum.rea = +datum.rea;
          datum.rad = +datum.rad;
        });

        const maxDate = data.reduce((max: Date, datum: any) => {
          return max > datum.jour ? max : datum.jour;
        }, new Date('2020-01-01'));

        return data.filter((datum: any) => datum.jour.getTime() === maxDate.getTime());
      }),
      shareReplay(1)
    );

    this.max$ = franceData$.pipe(
      map((data: any[]) => {
        return data.reduce((max, datum) =>
          ({
            cases: Math.max(max.cases, +datum.hosp + +datum.rad + +datum.dc + +datum.rea),
            deaths: Math.max(max.deaths, +datum.dc),
          }),
          {
            cases: 0,
            deaths: 0,
          }
        );
      })
    );

    this.dataType$ = this.store.pipe(
      select(getMapDataType)
    );

    this.scale$ = this.store.pipe(
      select(getMapScale)
    );

    this.legend$ = combineLatest([
      this.max$,
      this.scale$,
      this.dataType$
    ]).pipe(
      map(([max, scale, dataType]) => {
        const maxValue = max[dataType];
        const unit = dataType === 'mortality' ? '%' : '';
        let labels;
        if (scale === 'log') {

          const logScale = d3.scaleLog()
            .domain([1, maxValue])
            .range([0, 150]);

          const ticks = logScale.ticks(10);

          labels = ticks.map((i, index) => ({
            label: (index % 9 === 0 || index === ticks.length - 1) ? d3.format('.2s')(i) + unit : '',
            bottom: logScale(i)
          }));

        } else {

          const linearScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, 150]);

          const ticks = linearScale.ticks(10);

          labels = ticks.map(i => ({
            label: d3.format('.2s')(i) + unit,
            bottom: linearScale(i)
          }));

        }
        return {
          title: this.dataTypes.find(dt => dt.value === dataType)?.short,
          labels
        };
      }),
    );

    this.map = L.map('france', {
      zoomControl: false,
      attributionControl: false,
      minZoom: 5,
      maxZoom: 11
    }).setView([46, 2.2], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 9,
      minZoom: 2,
    }).addTo(this.map);

    const mainSub = combineLatest([
      this.dataService.getFranceGeoJson(),
      franceData$,
      this.max$,
      this.dataType$,
      this.scale$
    ]).pipe(
      map(([json, data, max, dataType, scale]) => ({
        max,
        dataType,
        scale,
        json: {
          ...json,
          features: (json as any).features.map(feature => ({
            ...feature,
            properties: {
              ...feature.properties,
              data: data.find((datum: any) => datum.dep === feature.properties.code)
            }
          }))
        }
      })),
      tap(({json, max, dataType, scale}) => {
        let fillColor;
        switch (dataType) {
          case 'cases':
            fillColor = d => d ? this.getColor(+d.dc + +d.hosp + +d.rea + +d.rad, max[dataType], scale) : 'grey';
            break;
          case 'deaths':
            fillColor = d => d ? this.getColor(d.dc, max[dataType], scale) : 'grey';
            break;
        }

        const geoJson = L.geoJSON(
          json as any,
          {
            style: d => ({
              fillColor: fillColor(d.properties.data),
              fillOpacity: 1,
              weight: 1,
              opacity: 1,
              color: '#999',
            }),
            onEachFeature: (feature, layer) => {
              layer.on({
                mouseover: e => {
                  const l = e.target;
                  l.setStyle({
                    weight: 4,
                    color: '#ddd'
                  });
                  l.bringToFront();
                  this.detailsEE.emit(e.target.feature.properties);
                },
                mouseout: e => geoJson.resetStyle(e.target),
                click: e => {
                  this.map.fitBounds(e.target.getBounds());
                  this.detailsEE.emit(e.target.feature.properties);
                }
              });
            }
          }
        );

        this.updateMap(geoJson);
      })
    ).subscribe();

    this.subscription.add(mainSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.map.remove();
  }

  updateMap(geoJson): void {
    if (this.geoJson) {
      this.geoJson.removeFrom(this.map);
    }
    this.geoJson = geoJson.addTo(this.map);
  }

  getColor(value: number, max: number, scale: 'linear' | 'log'): string {
    const [v, m] = scale === 'log' ? [Math.log10(value), Math.log10(max)] : [value, max];
    return d3.scaleLinear<string, string>()
      .domain([0, m])
      .range(['#0091ea', '#d50000'])(v);
  }

  setScale(scale: 'linear' | 'log') {
    this.store.dispatch(setMapScale({scale}));
  }

  setDataType(dataType: string) {
    this.store.dispatch(setMapDataType({dataType}));
  }

  toggleFullScreen() {
    this.fullScreen = !this.fullScreen;
    requestAnimationFrame(() => this.map.invalidateSize());
  }

}
