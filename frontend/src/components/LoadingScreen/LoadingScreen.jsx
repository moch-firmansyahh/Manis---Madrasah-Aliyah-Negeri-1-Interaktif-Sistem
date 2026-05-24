import React from 'react';
import './LoadingScreen.css';
import logoImg from '../../assets/logo.png';

const LoadingScreen = ({ fullScreen = true }) => {
  return (
    <div className={fullScreen ? "loading-screen-container" : "loading-screen-inline"}>
      <div className="loading-orbit-wrapper">
        <div className="orbit orbit-1">
          <div className="orbit-dot dot-1"></div>
        </div>
        <div className="orbit orbit-2">
          <div className="orbit-dot dot-2"></div>
        </div>
        <img src={logoImg} alt="Logo" className="loading-logo-static" />
      </div>
    </div>
  );
};

export default LoadingScreen;
