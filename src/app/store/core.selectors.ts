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
