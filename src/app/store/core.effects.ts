import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {act, Actions, createEffect, ofType} from '@ngrx/effects';
import {fetchCountries, fetchCountriesError, fetchCountriesSuccess} from './core.actions';
import {DataService} from '../data.service';
import {map} from 'rxjs/operators';

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
        map(countries => fetchCountriesSuccess({countries}))
      ),
      error: error => fetchCountriesError({error})
    })
  ));

}
