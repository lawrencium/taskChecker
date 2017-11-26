/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React from 'react';
import '../../styles/header.scss';

const Header = () => {
  return (
    <header className="header">
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

export default Header;
