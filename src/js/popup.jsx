import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'react-chrome-redux';
import Header from './components/Header';
import OverdueTaskList from './components/OverdueTaskList';

const store = new Store({
  portName: 'TaskChecker', // communication port name
});

const App = () => {
  return (
    <div>
      <Header />
      <OverdueTaskList />
    </div>
  );
};

store.ready().then(() => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
});
