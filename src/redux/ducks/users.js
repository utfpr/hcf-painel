import { createAction, handleAction } from 'redux-actions';

const logOutUser = createAction('USES/LOGOUT');

const setUser = createAction('USERS/SET_USER');
const setToken = createAction('TOKEN/SET_TOKEN');

export const actions = {
  logOutUser,
  setUser,
  setToken,
};

const userHandler = handleAction(
  setUser,
  (_, action) => {
    return action.payload;
  },
  null,
);

const tokenHandler = handleAction(
  setToken,
  (_, action) => action.payload,
  null,
);

export const reducers = {
  user: userHandler,
  token: tokenHandler,
};
