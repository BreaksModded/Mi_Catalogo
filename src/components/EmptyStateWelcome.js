import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './EmptyStateWelcome.css';

const EmptyStateWelcome = ({ onAddClick }) => {
  const { t } = useLanguage();

  return (
    <div className="empty-state-welcome">
      <div className="empty-state-container">
        {/* Header principal */}
        <div className="empty-state-header">
          <div className="empty-state-icon">🎬</div>
          <h1 className="empty-state-title">
            {t('emptyState.title')}
          </h1>
          <p className="empty-state-subtitle">
            {t('emptyState.subtitle')}
          </p>
        </div>

        {/* Guía paso a paso */}
        <div className="empty-state-guide">
          <h2 className="guide-title">{t('emptyState.guideTitle')}</h2>
          
          <div className="guide-steps">
            <div className="guide-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">{t('emptyState.step1Title')}</h3>
                <p className="step-description">{t('emptyState.step1Desc')}</p>
              </div>
            </div>

            <div className="guide-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">{t('emptyState.step2Title')}</h3>
                <p className="step-description">{t('emptyState.step2Desc')}</p>
              </div>
            </div>

            <div className="guide-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">{t('emptyState.step3Title')}</h3>
                <p className="step-description">{t('emptyState.step3Desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Características principales */}
        <div className="empty-state-features">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">{t('emptyState.feature1Title')}</h3>
            <p className="feature-desc">{t('emptyState.feature1Desc')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏷️</div>
            <h3 className="feature-title">{t('emptyState.feature2Title')}</h3>
            <p className="feature-desc">{t('emptyState.feature2Desc')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3 className="feature-title">{t('emptyState.feature3Title')}</h3>
            <p className="feature-desc">{t('emptyState.feature3Desc')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">{t('emptyState.feature4Title')}</h3>
            <p className="feature-desc">{t('emptyState.feature4Desc')}</p>
          </div>
        </div>

        {/* Call to action */}
        <div className="empty-state-cta">
          <button 
            className="cta-button primary"
            onClick={onAddClick}
          >
            <span className="button-icon">+</span>
            {t('emptyState.addFirstTitle')}
          </button>
          
          <p className="cta-hint">
            {t('emptyState.addFirstHint')}
          </p>
        </div>

        {/* Tips adicionales */}
        <div className="empty-state-tips">
          <h3 className="tips-title">{t('emptyState.tipsTitle')}</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <span className="tip-icon">💡</span>
              <span className="tip-text">{t('emptyState.tip1')}</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🔍</span>
              <span className="tip-text">{t('emptyState.tip2')}</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🎯</span>
              <span className="tip-text">{t('emptyState.tip3')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyStateWelcome;
