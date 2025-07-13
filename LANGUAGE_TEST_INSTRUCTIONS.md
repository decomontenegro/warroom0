# 🧪 Instruções para Testar o Sistema de Idiomas

## 1. Abrir a Página de Debug
- Abra http://localhost:5173/debug-language.html
- Esta página mostra o status do WebSocket e permite testar diretamente

## 2. Testar no WarRoom
- Abra http://localhost:5173/warroom em outra aba
- Abra o Console do navegador (F12)

## 3. No Console, Execute:
```javascript
// Ver estado atual
window.debugLanguage()

// Forçar idioma
window.forceLanguageChange('en-US')
```

## 4. Verificar WebSocket
No DevTools:
1. Vá para aba Network
2. Filtre por "WS" 
3. Clique em "warroom-ws"
4. Vá para aba Messages
5. Verifique se as mensagens têm o campo "language"

## 5. Logs do Servidor
No terminal do servidor, você deve ver:
```
[req-xxx] Language requested: en-US
```

## 6. Teste Completo
1. Mude o idioma para English
2. Digite "help me build a DeFi platform"
3. Verifique se as respostas vêm em inglês

## 🔍 O que Procurar

### ✅ Funcionando:
- Console mostra: "🌐 Language change requested: en-US"
- WebSocket envia: `"language": "en-US"`
- Servidor loga: "Language requested: en-US"
- Respostas em inglês

### ❌ Não Funcionando:
- Respostas ainda em português
- Campo "language" ausente no WebSocket
- Servidor não loga o idioma

## Debug Adicional

Se ainda não funcionar, no console execute:
```javascript
// Ver todas as mensagens WebSocket
const originalSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(data) {
  console.log('📤 WS Send:', JSON.parse(data));
  originalSend.call(this, data);
};
```