import { applyMiddleware, createStore } from 'redux';
import { alias } from 'react-chrome-redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

import aliases from './aliases';

const store = createStore(
  reducers.overdueTasks,
  applyMiddleware(alias(aliases), thunk),
);

export default store;
