import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './WelcomeScreen.css';

const WelcomeScreen = () => {
  const { t } = useLanguage();

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <h1 className="welcome-title">
          🎬 {t('welcome.title')}
        </h1>
        
        <p className="welcome-subtitle">
          {t('welcome.subtitle')}
        </p>
        
        <div className="welcome-features">
          <div className="welcome-feature">
            <div className="feature-icon">📚</div>
            <h3 className="feature-title">
              {t('welcome.feature1')}
            </h3>
            <p className="feature-description">
              {t('welcome.feature1Desc')}
            </p>
          </div>
          
          <div className="welcome-feature">
            <div className="feature-icon">🏷️</div>
            <h3 className="feature-title">
              {t('welcome.feature2')}
            </h3>
            <p className="feature-description">
              {t('welcome.feature2Desc')}
            </p>
          </div>
          
          <div className="welcome-feature">
            <div className="feature-icon">⭐</div>
            <h3 className="feature-title">
              {t('welcome.feature3')}
            </h3>
            <p className="feature-description">
              {t('welcome.feature3Desc')}
            </p>
          </div>
        </div>
        
        <div className="welcome-cta">
          <h3 className="cta-title">
            {t('welcome.getStarted')}
          </h3>
          <p className="cta-description">
            {t('welcome.loginPrompt')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
