import { useState, useEffect } from 'react';
import { i18n } from '../../services/i18n-config';
import './LanguageDebugger.css';

const LanguageDebugger = ({ currentLanguage }) => {
  const [debugInfo, setDebugInfo] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        componentProp: currentLanguage,
        localStorage: localStorage.getItem('warroom-language'),
        i18nLanguage: i18n.getLanguage(),
        languageManager: window.languageManager?.getLanguage(),
        ultrathinkLanguage: window.ultrathinkWorkflow?.getLanguage(),
        timestamp: new Date().toLocaleTimeString()
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);

    // Listen for language changes
    const handleLanguageChange = () => updateDebugInfo();
    window.addEventListener('languagechange', handleLanguageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [currentLanguage]);

  if (!isVisible) {
    return (
      <button 
        className="language-debug-toggle"
        onClick={() => setIsVisible(true)}
        title="Show Language Debug Info"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="language-debugger">
      <div className="debug-header">
        <h4>🔍 Language System Debug</h4>
        <button onClick={() => setIsVisible(false)}>×</button>
      </div>
      <div className="debug-content">
        <div className="debug-item">
          <span className="debug-label">Component Prop:</span>
          <span className={`debug-value ${debugInfo.componentProp === debugInfo.localStorage ? 'synced' : 'out-of-sync'}`}>
            {debugInfo.componentProp}
          </span>
        </div>
        <div className="debug-item">
          <span className="debug-label">LocalStorage:</span>
          <span className="debug-value">{debugInfo.localStorage || 'not set'}</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">i18n Instance:</span>
          <span className={`debug-value ${debugInfo.i18nLanguage === debugInfo.componentProp ? 'synced' : 'out-of-sync'}`}>
            {debugInfo.i18nLanguage}
          </span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Language Manager:</span>
          <span className={`debug-value ${debugInfo.languageManager === debugInfo.componentProp ? 'synced' : 'out-of-sync'}`}>
            {debugInfo.languageManager || 'not initialized'}
          </span>
        </div>
        <div className="debug-item">
          <span className="debug-label">UltraThink:</span>
          <span className={`debug-value ${debugInfo.ultrathinkLanguage === debugInfo.componentProp ? 'synced' : 'out-of-sync'}`}>
            {debugInfo.ultrathinkLanguage || 'not active'}
          </span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Last Update:</span>
          <span className="debug-value">{debugInfo.timestamp}</span>
        </div>
      </div>
      <div className="debug-test">
        <button onClick={() => {
          const testString = i18n.t('system.analyzing');
          alert(`Test translation: "${testString}"`);
        }}>
          Test Translation
        </button>
      </div>
    </div>
  );
};

export default LanguageDebugger;