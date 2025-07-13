/**
 * Language Initializer Component
 * Garante que o idioma seja configurado corretamente antes de renderizar o WarRoom
 */

import { useEffect, useState } from 'react';
import { i18n } from '../../services/i18n-config';
import WarRoomWhatsApp from './WarRoomWhatsApp';

function WarRoomLanguageInitializer() {
  const [isReady, setIsReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('warroom-language') || 'pt-BR';
  });

  useEffect(() => {
    console.log('🌍 WarRoom Language Initializer');
    console.log('📍 Saved language:', currentLanguage);
    
    // Configurar i18n ANTES de renderizar o componente principal
    i18n.setLanguage(currentLanguage);
    console.log('✅ i18n initialized with:', i18n.getLanguage());
    
    // Configurar window.ultrathinkWorkflow se existir
    if (window.ultrathinkWorkflow) {
      window.ultrathinkWorkflow.setLanguage(currentLanguage);
      console.log('✅ UltraThink initialized with:', window.ultrathinkWorkflow.getLanguage());
    }
    
    // Marcar como pronto
    setIsReady(true);
  }, [currentLanguage]);

  // Não renderizar até que o idioma esteja configurado
  if (!isReady) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f0f2f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Initializing Language System...</h2>
          <p>Language: {currentLanguage}</p>
        </div>
      </div>
    );
  }

  // Passar o idioma como prop para garantir sincronização
  return <WarRoomWhatsApp initialLanguage={currentLanguage} />;
}

export default WarRoomLanguageInitializer;