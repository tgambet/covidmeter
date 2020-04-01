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

export const fetchGeoJson = createAction(
  '[Core] Fetch GeoJson'
);

export const fetchGeoJsonSuccess = createAction(
  '[Core] Fetch GeoJson Success',
  props<{geoJson: any}>()
);

export const fetchGeoJsonError = createAction(
  '[Core] Fetch GeoJson Error',
  props<{error: any}>()
);

export const fetchHistorical = createAction(
  '[Core] Fetch Historical'
);

export const fetchHistoricalSuccess = createAction(
  '[Core] Fetch Historical Success',
  props<{historical: any[]}>()
);

export const fetchHistoricalError = createAction(
  '[Core] Fetch Historical Error',
  props<{error: any}>()
);
