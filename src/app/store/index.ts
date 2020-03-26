import {CoreState} from "./core.state";
import {coreReducer} from "./core.reducer";
import {ActionReducerMap} from "@ngrx/store";

export interface State {
  core: CoreState;
}

export const reducers: ActionReducerMap<State> = {
  core: coreReducer,
};
