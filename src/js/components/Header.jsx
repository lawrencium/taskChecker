/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React from 'react';
import { connect } from 'react-redux';
import { values } from 'lodash';
import classNames from 'classnames';
import '../../styles/header.scss';
import constants from '../constants';

const Header = ({ hasOverdueTasks }) => {
  return (
    <header className={classNames('header', { overdue: hasOverdueTasks })}>
      <span className="header-left">
        <i className="fa fa-check-circle logo external-link" onClick={linkToGoogleTasksUrl} />
        &quot;A cluttered to-do list is a cluttered mind&quot;
      </span>
      <span className="header-right" />
    </header>
  );
};

const linkToGoogleTasksUrl = () => {
  chrome.tabs.create({
    url: 'https://mail.google.com/tasks/canvas',
  });
};

const mapStateToProps = (state) => {
  const tasks = values(state);
  const hasOverdueTasks = tasks.some(task => task.taskStatus === constants.TASK_STATUS.OVERDUE);
  return {
    hasOverdueTasks,
  };
};

export default connect(mapStateToProps)(Header);
