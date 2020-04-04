import {ActionReducer, createReducer, on} from '@ngrx/store';
import {CoreState, initialState} from './core.state';
import {
  fetchCountriesSuccess,
  fetchGeoJsonSuccess,
  fetchHistoricalSuccess,
  fetchYesterdayCountriesSuccess,
  setFilterFrom,
  setMapDataType,
  setMapScale,
  setMaxCases,
  setNormalize,
  setSortBy,
  setWorld,
  setYesterdayWorld
} from './core.actions';

export const coreReducer: ActionReducer<CoreState> = createReducer(
  initialState,
  on(fetchCountriesSuccess, (state, {countries}) => (
    {...state, countries }
  )),
  on(fetchYesterdayCountriesSuccess, (state, {yesterdayCountries}) => (
    {...state, yesterdayCountries }
  )),
  on(setNormalize, (state, {normalize}) => (
    {...state, normalize}
  )),
  on(setMaxCases, (state, {maxCases}) => (
    {...state, maxCases}
  )),
  on(setSortBy, (state, {sortBy}) => (
    {...state, sortBy}
  )),
  on(setFilterFrom, (state, {filterFrom}) => (
    {...state, filterFrom}
  )),
  on(setMapDataType, (state, {dataType}) => (
    {...state, map: {...state.map, dataType}}
  )),
  on(setMapScale, (state, {scale}) => (
    {...state, map: {...state.map, scale}}
  )),
  on(fetchGeoJsonSuccess, (state, {geoJson}) => (
    {...state, map: {...state.map, geoJson}}
  )),
  on(fetchHistoricalSuccess, (state, {historical}) => (
    {...state, historical}
  )),
  on(setWorld, (state, {world}) => (
    {...state, world}
  )),
  on(setYesterdayWorld, (state, {yesterdayWorld}) => (
    {...state, yesterdayWorld}
  ))
);
