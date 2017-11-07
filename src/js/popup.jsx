import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'react-chrome-redux';
import Header from './components/Header';
import TaskList from './components/TaskList';
import actions from './redux/actions';

const store = new Store({
  portName: 'TaskChecker', // communication port name
});

const App = () => {
  return (
    <div>
      <Header />
      <TaskList />
    </div>
  );
};

store.ready().then(() => {
  store.dispatch(actions.asyncGetTasks());
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
});
