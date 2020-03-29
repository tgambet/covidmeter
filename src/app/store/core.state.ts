import {Country} from '../data.service';

export interface CoreState {
  countries: Country[];
  normalize: boolean;
  maxCases: number;
  sortBy: string;
  filterFrom: number;
  map: {
    dataType: string;
    scale: 'linear' | 'log'
  };
}

export const initialState: CoreState = {
  countries: [],
  normalize: false,
  maxCases: 0,
  sortBy: 'cases',
  filterFrom: 10,
  map: {
    dataType: 'cases',
    scale: 'log'
  }
};
