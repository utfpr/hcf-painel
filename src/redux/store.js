import {
    createStore,
    compose as reduxCompose,
    applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';

import { actions, reducers } from './ducks';

function reducer(state, action) {
    if (action.type === actions.users.logOutUser().type) {
        return reducers({}, action);
    }
    return reducers(state, action);
}

const compose = __DEV__ && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ // eslint-disable-line no-underscore-dangle
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ // eslint-disable-line no-underscore-dangle
    : reduxCompose;

const store = createStore(reducer, compose(applyMiddleware(thunk)));

export default store;
