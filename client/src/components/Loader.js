// src/components/Loader.js
import React from 'react';
import '../scss/Loading.scss'; // Path to your SCSS file

const Loader = () => {
  return (
    <div className="loader">
      <div className="outer"></div>
      <div className="middle"></div>
      <div className="inner"></div>
    </div>
  );
};

export default Loader;
