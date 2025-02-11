import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {filter, map, switchMap} from 'rxjs/operators';
import {select, Store} from '@ngrx/store';
import {getCountryByName} from './store/core.selectors';
import {Observable} from 'rxjs';
import {Country} from './data.service';

@Component({
  selector: 'app-country',
  template: `
    <ng-container *ngIf="country$ | async; let country">
      <app-overview [countryName]="country.country">
        <a mat-raised-button [routerLink]="['/']" color="accent" class="back">
          <mat-icon>keyboard_arrow_left</mat-icon>
        </a>
        <span>{{country.country}} overview</span>
        <img [src]="country.countryInfo.flag" alt="flag"/>
      </app-overview>
      <app-timeline [countryName]="country.country"></app-timeline>
      <app-growth [countryName]="country.country"></app-growth>
    </ng-container>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
      box-sizing: border-box;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    img {
      display: inline-block;
      margin-left: auto;
      height: 24px;
      overflow: hidden;
    }

    app-timeline, app-growth {
      margin: 16px 0;
    }

    .back {
      padding: 0 8px;
      min-width: initial;
      margin-left: -8px;
      margin-right: 12px;
    }
  `]
})
export class CountryComponent implements OnInit {

  country$: Observable<Country>;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
  ) {
  }

  ngOnInit(): void {
    this.country$ = this.route.paramMap.pipe(
      map(params => params.get('name')),
      switchMap(name => this.store.pipe(select(getCountryByName, name))),
      filter(country => !!country),
    );
  }
}
