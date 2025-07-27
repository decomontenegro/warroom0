/**
 * Script para atualizar o servidor War Room para usar o handler enhanced
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Caminho do arquivo do servidor
const serverPath = path.join(__dirname, 'warroom-server.js');

// Ler o conteúdo atual
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Verificar se já está usando o handler enhanced
if (serverContent.includes('warroom-handlers-enhanced')) {
  console.log('✅ Servidor já está usando o handler enhanced!');
  process.exit(0);
}

// Fazer as substituições necessárias
serverContent = serverContent.replace(
  "import WarRoomHandlers from './services/warroom-handlers.js';",
  "import WarRoomEnhancedHandlers from './services/warroom-handlers-enhanced.js';"
);

serverContent = serverContent.replace(
  "const handlers = new WarRoomHandlers();",
  "const handlers = new WarRoomEnhancedHandlers();"
);

// Adicionar handler para mensagens do usuário no WebSocket
const wsHandlerCode = `
      // Handler para mensagens do usuário
      if (data.type === 'user_message') {
        handlers.handleUserMessage(ws, data);
        return;
      }
      
      // Handler para queries do ultrathink
      if (data.type === 'ultrathink_query') {
        handlers.handleUltraThinkQuery(ws, data);
        return;
      }
`;

// Inserir o código no lugar certo
serverContent = serverContent.replace(
  "if (data.type === 'agent-request') {",
  wsHandlerCode + "\n      if (data.type === 'agent-request') {"
);

// Salvar o arquivo atualizado
fs.writeFileSync(serverPath, serverContent);

console.log('✅ Servidor atualizado com sucesso!');
console.log('📝 Mudanças aplicadas:');
console.log('  - Importação do WarRoomEnhancedHandlers');
console.log('  - Instanciação do handler enhanced');
console.log('  - Adição de handlers para user_message e ultrathink_query');
console.log('\n🚀 Reinicie o servidor para aplicar as mudanças.');