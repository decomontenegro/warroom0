/**
 * Script para corrigir problemas de inicialização do idioma
 * Execute este script para forçar a reinicialização correta do sistema de idiomas
 */

// 1. Limpar cache do navegador
console.log('🧹 Limpando cache do idioma...');
localStorage.removeItem('warroom-language');

// 2. Definir idioma desejado
const desiredLanguage = 'en-US'; // Mude para o idioma desejado
localStorage.setItem('warroom-language', desiredLanguage);
console.log(`✅ Idioma definido para: ${desiredLanguage}`);

// 3. Recarregar a página
console.log('🔄 Recarregando a página em 2 segundos...');
setTimeout(() => {
  window.location.reload();
}, 2000);