/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React from 'react';
import { connect } from 'react-redux';
import '../../styles/header.scss';
import actions from '../redux/actions';

const Header = (props) => {
  return (
    <header className="header">
      <span className="header-left">
        <i className="fa fa-check-circle logo" />
        &quot;A cluttered todo list is a cluttered mind&quot;
      </span>
      <span className="header-right">
        <span className="small-icon-container">
          <i className="fa fa-refresh refresh-button" onClick={props.refreshOverdueTasks} />
        </span>
        <span className="small-icon-container">
          <i className="fa fa-external-link external-link" onClick={linkToGoogleTasksUrl} />
        </span>
      </span>
    </header>
  );
};

const linkToGoogleTasksUrl = () => {
  chrome.tabs.create({
    url: 'https://mail.google.com/tasks/canvas',
  });
};

const mapDispatchToProps = (dispatch) => {
  return {
    refreshOverdueTasks: () => {
      dispatch(actions.asyncUpsertOverdueTasks());
      dispatch(actions.refreshOverdueTasks());
    },
  };
};

export default connect(null, mapDispatchToProps)(Header);
