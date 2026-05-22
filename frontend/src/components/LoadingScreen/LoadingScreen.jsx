import React from 'react';
import './LoadingScreen.css';
import logoImg from '../../assets/logo.png';

const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      <div className="loading-spinner-wrapper">
        <img src={logoImg} alt="MAN 1 Sumedang Logo" className="loading-logo-spin" />
      </div>
      <h2 className="loading-text">Memuat...</h2>
    </div>
  );
};

export default LoadingScreen;
