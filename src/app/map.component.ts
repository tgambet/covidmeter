import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {PathOptions} from 'leaflet';
import {select, Store} from '@ngrx/store';
import {getCountries} from './store/core.selectors';
import {map, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import * as d3 from 'd3';
import {combineLatest, Observable, of} from 'rxjs';

@Component({
  selector: 'app-map',
  template: `
    <div id="map"></div>
    <div class="legend">
      <div class="colors"></div>
      <div class="labels">
        <span class="label" *ngFor="let label of labels$ | async" [style.bottom]="label.bottom - 5 + 'px'">
          -&nbsp;&nbsp;{{label.label | number}}
        </span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
    #map {
      width: 100%;
      height: calc(100vh - 56px);
    }
    .legend {
      position: absolute;
      bottom: 16px;
      left: 16px;
      background-color: #303030;
      padding: 12px 8px;
      border-radius: 4px;
      z-index: 400;
      display: flex;
    }
    .colors {
      height: 150px;
      width: 16px;
      background: linear-gradient(to top, #0091ea, #d50000);
    }
    .labels {
      height: 150px;
      width: 60px;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .label {
      font-size: 10px;
      line-height: 12px;
      position: absolute;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit {

  labels$: Observable<any[]> = of([
    {label: '1', bottom: 0},
    {label: '10', bottom: 1 / Math.log10(123000) * 150},
    {label: '100', bottom: 2 / Math.log10(123000) * 150},
    {label: '1000', bottom: 3 / Math.log10(123000) * 150},
    {label: '10000', bottom: 4 / Math.log10(123000) * 150},
    {label: '100000', bottom: 5 / Math.log10(123000) * 150},
  ]);

  max$: Observable<number> = of(120000);

  constructor(
    private store: Store,
    private httpClient: HttpClient
  ) {
  }

  ngOnInit(): void {
    const world = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 9,
      minZoom: 2,
    }).addTo(world);

    combineLatest([
      this.httpClient.get('/assets/countries.geo.json'),
      this.store.pipe(select(getCountries)),
      this.max$,
    ]).pipe(
      map(([json, countries, max]) => ({
        ...json,
        max,
        features: (json as any).features.map(f => ({
          ...f,
          properties: {
            ...f.properties,
            cases: countries.find(c => c.countryInfo.iso3 === f.id)?.cases
          }
        }))
      })),
      tap((json: any) =>
        L.geoJSON(
          json,
          {style: d => this.style(d, json.max)}
        ).addTo(world)
      )
    ).subscribe();
  }

  style(feature: any, max: number): PathOptions {
    return {
      fillColor: this.getColor(feature.properties.cases, max),
      fillOpacity: 1,
      weight: 1,
      opacity: 1,
      color: '#333',
    };
  }

  getColor(d: number, max: number): string {
    return d3.scaleLinear<string, string>()
      .domain([0, Math.log10(max)])
      .range(['#0091ea', '#d50000'])(Math.log10(d)) || 'grey';
  }

}
