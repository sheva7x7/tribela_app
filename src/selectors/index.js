import { createSelector } from 'reselect';

const path = (state) => state.routing.location.pathname;

export const getPath = createSelector(
  [ path ],
  path => path
)