import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'react-chrome-redux';
import Header from './components/Header';
import TaskList from './components/TaskList';
import actions from './redux/actions';
import AddTask from './components/AddTask';

const store = new Store({
  portName: 'TaskChecker', // communication port name
});

const App = () => {
  return (
    <div>
      <Header />
      <AddTask />
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
  resizePopupWindow();
});


const resizePopupWindow = () => {
  // Chrome extensions have a bug where sometimes the popup is not drawn to the right size. The below hack forces
  // Chrome to re-draw the popup by changing the width of the popup window. The width should be taken from `popup.scss`
  // from the $popup-width variable.
  setTimeout(() => {
    document.getElementsByTagName('body')[0].style.width = '451px';
  }, 180);

  setTimeout(() => {
    document.getElementsByTagName('body')[0].style.width = '450px';
  }, 200);
};
