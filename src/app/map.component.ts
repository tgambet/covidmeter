import {ChangeDetectionStrategy, Component, EventEmitter, HostBinding, OnDestroy, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {select, Store} from '@ngrx/store';
import {getCountries, getGeoJson, getMapDataType, getMapScale} from './store/core.selectors';
import {filter, map, tap} from 'rxjs/operators';
import * as d3 from 'd3';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {setMapDataType, setMapScale} from './store/core.actions';

@Component({
  selector: 'app-map',
  template: `
    <div id="map"></div>
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
      <h3>{{d.name}}</h3>
      <ng-container *ngIf="d.country">
        <ul class="overview">
          <li>
            <span class="label deaths">Deaths</span>
            <span class="value">{{d.country.deaths | number}}</span>
          </li>
          <li>
            <span class="label critical">Critical</span>
            <span class="value">{{d.country.critical | number}}</span>
          </li>
          <li>
            <span class="label recovered">Recovered</span>
            <span class="value">{{d.country.recovered | number}}</span>
          </li>
          <li>
            <span class="label active">Others</span>
            <span class="value">{{d.country.cases - d.country.deaths - d.country.critical - d.country.recovered | number}}</span>
          </li>
          <li class="total">
            <span class="label">Total</span>
            <span class="value">{{d.country.cases | number}}</span>
          </li>
        </ul>
        <app-bar [dataSet]="[
          {value: d.country.deaths, color: 'black'},
          {value: d.country.critical, color: '#ff5722'},
          {value: d.country.recovered, color: '#4caf50'},
          {value: d.country.cases - d.country.deaths - d.country.critical - d.country.recovered, color: '#9E9E9E'}
        ]"></app-bar>
      </ng-container>
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

    #map {
      width: 100%;
      height: calc(100vh - 56px);
    }

    :host.fullscreen #map {
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
      flex: 0 0 50%;
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
      flex: 0 0 67px;
      text-align: right;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit, OnDestroy {

  @HostBinding('class.fullscreen')
  fullScreen = false;

  dataTypes: any[] = [
    {title: 'Number of cases', value: 'cases', short: 'Cases'},
    {title: 'Number of deaths', value: 'deaths', short: 'Deaths'},
    {title: 'Cases per million', value: 'casesPerOneMillion', short: 'Cases/1M'},
    {title: 'Deaths per million', value: 'deathsPerOneMillion', short: 'Deaths/1M'},
    {title: 'Mortality rate', value: 'mortality', short: 'Mortality'},
  ];

  max$: Observable<{
    cases: number,
    deaths: number,
    casesPerOneMillion: number,
    deathsPerOneMillion: number,
    mortality: number
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
    private store: Store
  ) {
  }

  ngOnInit(): void {

    this.details$ = this.detailsEE.asObservable();

    const mainCountries$ = this.store.pipe(
      select(getCountries),
      map(countries => countries.filter(
        c => c.cases * 1000000 / c.casesPerOneMillion > 100000
      ))
    );

    this.max$ = mainCountries$.pipe(
      map(countries => countries.reduce((max, country) =>
          ({
            cases: Math.max(max.cases, country.cases),
            deaths: Math.max(max.deaths, country.deaths),
            casesPerOneMillion: Math.max(max.casesPerOneMillion, country.casesPerOneMillion),
            deathsPerOneMillion: Math.max(max.deathsPerOneMillion, country.deathsPerOneMillion),
            mortality: country.cases === 0 ? max.mortality : Math.max(max.mortality, country.deaths / country.cases * 100),
          }),
        {
          cases: 0,
          deaths: 0,
          casesPerOneMillion: 0,
          deathsPerOneMillion: 0,
          mortality: 0
        }
      ))
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

    this.map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      minZoom: 1,
      maxZoom: 9
    }).setView([30, 0], 2);

    /*L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      // subdomains: 'abcd',
      maxZoom: 9,
      minZoom: 2,
    }).addTo(this.world);*/

    const mainSub = combineLatest([
      this.store.pipe(select(getGeoJson), filter(json => !!json)),
      mainCountries$,
      this.max$,
      this.dataType$,
      this.scale$
    ]).pipe(
      map(([json, countries, max, dataType, scale]) => ({
        max,
        dataType,
        scale,
        json: {
          ...json,
          features: (json as any).features.map(feature => ({
            ...feature,
            properties: {
              ...feature.properties,
              country: countries.find(c => c.countryInfo.iso3 === feature.id)
            }
          }))
        }
      })),
      tap(({json, max, dataType, scale}) => {
        let fillColor;
        switch (dataType) {
          case 'cases':
          case 'deaths':
          case 'casesPerOneMillion':
          case 'deathsPerOneMillion':
            fillColor = c => c ? this.getColor(c[dataType], max[dataType], scale) : 'grey';
            break;
          case 'mortality':
            fillColor = c => c && c.cases > 0 ? this.getColor(c.deaths / c.cases * 100, max.mortality, scale) : 'grey';
        }

        const geoJson = L.geoJSON(
          json as any,
          {
            style: d => ({
              fillColor: fillColor(d.properties.country),
              fillOpacity: 1,
              weight: 1,
              opacity: 1,
              color: '#333',
            }),
            onEachFeature: (feature, layer) => {
              layer.on({
                mouseover: e => {
                  const l = e.target;
                  l.setStyle({
                    weight: 3,
                    color: '#000'
                  });
                  l.bringToFront();
                  this.detailsEE.emit(e.target.feature.properties);
                },
                mouseout: e => geoJson.resetStyle(e.target),
                click: e => {
                  this.map.panTo(e.target.getBounds().getCenter());
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
