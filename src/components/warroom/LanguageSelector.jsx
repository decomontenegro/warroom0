import { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../../services/i18n-config';
import './LanguageSelector.css';

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const currentLang = SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES['pt-BR'];
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLanguageSelect = (langCode) => {
    onLanguageChange(langCode);
    setIsOpen(false);
  };
  
  return (
    <div className="language-selector" ref={dropdownRef}>
      <button 
        className="language-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Selecionar idioma"
      >
        <span className="flag">{currentLang.flag}</span>
        <span className="language-name">{currentLang.code}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
            <div
              key={code}
              className={`language-option ${code === currentLanguage ? 'active' : ''}`}
              onClick={() => handleLanguageSelect(code)}
            >
              <span className="flag">{lang.flag}</span>
              <span className="language-name">{lang.name}</span>
              {code === currentLanguage && <span className="check">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;