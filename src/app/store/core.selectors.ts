import {createFeatureSelector, createSelector} from '@ngrx/store';
import {CoreState} from './core.state';

export const selectCoreState = createFeatureSelector<CoreState>('core');

export const getCountries = createSelector(
  selectCoreState,
  state => state.countries
);

export const getNormalize = createSelector(
  selectCoreState,
  state => state.normalize
);

export const getMaxCases = createSelector(
  selectCoreState,
  state => state.maxCases
);

export const getSortBy = createSelector(
  selectCoreState,
  state => state.sortBy
);

export const getFilterFrom = createSelector(
  selectCoreState,
  state => state.filterFrom
);

export const getCountryByName = createSelector(
  selectCoreState,
  (state, name: string) => state.countries.find(c => c.country === name)
);

export const getMapDataType = createSelector(
  selectCoreState,
  state => state.map.dataType
);

export const getMapScale = createSelector(
  selectCoreState,
  state => state.map.scale
);

export const getGeoJson = createSelector(
  selectCoreState,
  state => state.map.geoJson
);

export const getHistorical = createSelector(
  selectCoreState,
  state => state.historical
);

export const getYesterdayCountryByName = createSelector(
  selectCoreState,
  (state, name: string) => state.yesterdayCountries.find(c => c.country === name)
);

export const getWorld = createSelector(
  selectCoreState,
  state => state.world
);

export const getYesterdayWorld = createSelector(
  selectCoreState,
  state => state.yesterdayWorld
);
