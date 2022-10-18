import { combineReducers } from 'redux';

import * as users from './users';

export const actions = {
  users: users.actions,
};

export const reducers = combineReducers({
  ...users.reducers,
});
