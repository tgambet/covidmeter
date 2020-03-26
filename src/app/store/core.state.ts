import {Country} from "../data.service";

export interface CoreState {
  countries: Country[];
  normalize: boolean;
  maxCases: number;
}

export const initialState: CoreState = {
  countries: [],
  normalize: false,
  maxCases: 0,
};
