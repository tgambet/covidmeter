import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {act, Actions, createEffect, ofType} from '@ngrx/effects';
import {
  fetchCountries,
  fetchCountriesError,
  fetchCountriesSuccess,
  fetchGeoJson,
  fetchGeoJsonError,
  fetchGeoJsonSuccess,
  fetchHistorical,
  fetchHistoricalError,
  fetchHistoricalSuccess,
  fetchYesterdayCountries,
  fetchYesterdayCountriesError,
  fetchYesterdayCountriesSuccess,
  setWorld,
  setYesterdayWorld
} from './core.actions';
import {DataService} from '../data.service';
import {concatMap, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {reduceToWorld} from '../utils';

@Injectable()
export class CoreEffects {

  constructor(
    private actions$: Actions,
    private store: Store,
    private dataService: DataService
  ) {
  }

  fetchCountries$ = createEffect(() => this.actions$.pipe(
    ofType(fetchCountries),
    act({
      project: () => this.dataService.getCountries().pipe(
        concatMap(countries => of(
          setWorld({world: reduceToWorld(countries)}),
          fetchCountriesSuccess({countries})
        ))
      ),
      error: error => fetchCountriesError({error})
    })
  ));

  fetchYesterdayCountries$ = createEffect(() => this.actions$.pipe(
    ofType(fetchYesterdayCountries),
    act({
      project: () => this.dataService.getYesterdayCountries().pipe(
        concatMap(yesterdayCountries => of(
          setYesterdayWorld({yesterdayWorld: reduceToWorld(yesterdayCountries)}),
          fetchYesterdayCountriesSuccess({yesterdayCountries})
        ))
      ),
      error: error => fetchYesterdayCountriesError({error})
    })
  ));

  fetchGeoJson$ = createEffect(() => this.actions$.pipe(
    ofType(fetchGeoJson),
    act({
      project: () => this.dataService.getGeoJson().pipe(
        map(geoJson => fetchGeoJsonSuccess({geoJson}))
      ),
      error: error => fetchGeoJsonError({error})
    })
  ));

  fetchHistorical$ = createEffect(() => this.actions$.pipe(
    ofType(fetchHistorical),
    act({
      project: () => this.dataService.getHistorical().pipe(
        map(historical => fetchHistoricalSuccess({historical}))
      ),
      error: error => fetchHistoricalError({error})
    })
  ));

}
