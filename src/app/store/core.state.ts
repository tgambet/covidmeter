import {Country} from '../data.service';

export interface CoreState {
  countries: Country[];
  normalize: boolean;
  maxCases: number;
  sortBy: string;
  filterFrom: number;
}

export const initialState: CoreState = {
  countries: [],
  normalize: false,
  maxCases: 0,
  sortBy: 'cases',
  filterFrom: 10,
};
