import { actions } from '../ducks';

export function logInUser({ token, user }) {
    return async dispatch => {
        await dispatch(actions.users.setToken(token));
        await dispatch(actions.users.setUser(user));
    };
}

export function logOutUser() {
    return async dispatch => {
        await dispatch(actions.users.logOutUser());
    };
}
