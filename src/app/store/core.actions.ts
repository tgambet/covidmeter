import {createAction, props} from '@ngrx/store';
import {Country} from '../data.service';

export const fetchCountries = createAction(
  '[Core] Fetch Countries'
);

export const fetchCountriesSuccess = createAction(
  '[Core] Fetch Countries Success',
  props<{countries: Country[]}>()
);

export const fetchCountriesError = createAction(
  '[Core] Fetch Countries Success',
  props<{error: any}>()
);

export const setNormalize = createAction(
  '[Core] Set Normalize',
  props<{normalize: boolean}>()
);

export const setMaxCases = createAction(
  '[Core] Set Max Cases',
  props<{maxCases: number}>()
);

export const setSortBy = createAction(
  '[Core] Set Sort By',
  props<{sortBy: string}>()
);

export const setFilterFrom = createAction(
  '[Core] Set Filter From',
  props<{filterFrom: number}>()
);

export const setMapDataType = createAction(
  '[Core] Set Map Date Type',
  props<{dataType: string}>()
);

export const setMapScale = createAction(
  '[Core] Set Map Scale',
  props<{scale: 'linear' | 'log'}>()
);
