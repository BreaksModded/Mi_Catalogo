import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaListUl, FaTags, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import './WelcomeScreen.css';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: 0.1 * i, duration: 0.5, ease: 'easeOut' } })
};

const WelcomeScreen = () => {
  const { t } = useLanguage();

  const openAuth = (mode) => {
    const event = new CustomEvent('open-auth', { detail: { mode } });
    window.dispatchEvent(event);
  };

  return (
    <div className="welcome-screen">
      {/* Background accents */}
      <div className="ws-bg ws-bg-1" />
      <div className="ws-bg ws-bg-2" />

      <motion.div 
        className="welcome-container"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 className="welcome-title" variants={fadeUp} initial="hidden" animate="visible">
          <span className="welcome-emoji">🎬</span>
          <span className="welcome-text">{t('welcome.title')}</span>
        </motion.h1>

        <motion.p className="welcome-subtitle" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          {t('welcome.subtitle')}
        </motion.p>

        <motion.div className="welcome-actions" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <button className="ws-btn ws-primary" onClick={() => openAuth('register')}>
            <FaUserPlus /> {t('auth.register')}
          </button>
          <button className="ws-btn ws-secondary" onClick={() => openAuth('login')}>
            <FaSignInAlt /> {t('auth.login')}
          </button>
        </motion.div>

        <motion.div className="welcome-features" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
          <div className="welcome-feature">
            <div className="feature-icon"><FaListUl /></div>
            <h3 className="feature-title">{t('welcome.feature1')}</h3>
            <p className="feature-description">{t('welcome.feature1Desc')}</p>
          </div>

          <div className="welcome-feature">
            <div className="feature-icon"><FaTags /></div>
            <h3 className="feature-title">{t('welcome.feature2')}</h3>
            <p className="feature-description">{t('welcome.feature2Desc')}</p>
          </div>

          <div className="welcome-feature">
            <div className="feature-icon"><FaStar /></div>
            <h3 className="feature-title">{t('welcome.feature3')}</h3>
            <p className="feature-description">{t('welcome.feature3Desc')}</p>
          </div>
        </motion.div>

        <motion.div className="welcome-cta" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <h3 className="cta-title">{t('welcome.getStarted')}</h3>
          <p className="cta-description">{t('welcome.loginPrompt')}</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
