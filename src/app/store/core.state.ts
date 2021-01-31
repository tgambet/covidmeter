import {Country, OverviewData} from '../data.service';

export interface CoreState {
  world: OverviewData;
  yesterdayWorld: OverviewData;
  countries: Country[];
  yesterdayCountries: Country[];
  normalize: boolean;
  maxCases: number;
  sortBy: string;
  filterFrom: number;
  map: {
    geoJson: any;
    dataType: string;
    scale: 'linear' | 'log'
  };
  historical: any[];
}

export const initialState: CoreState = {
  world: {
    country: 'World',
    cases: 0,
    todayCases: 0,
    deaths: 0,
    todayDeaths: 0,
    recovered: 0,
    active: 0,
    critical: 0,
    updated: 0,
  },
  yesterdayWorld: {
    country: 'World',
    cases: 0,
    todayCases: 0,
    deaths: 0,
    todayDeaths: 0,
    recovered: 0,
    active: 0,
    critical: 0,
    updated: 0,
  },
  countries: [],
  yesterdayCountries: [],
  normalize: false,
  maxCases: 0,
  sortBy: 'cases',
  filterFrom: 100000,
  map: {
    geoJson: null,
    dataType: 'cases',
    scale: 'log'
  },
  historical: [],
};
