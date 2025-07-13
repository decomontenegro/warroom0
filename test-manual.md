# 🧪 Teste Manual do UltraThink

## 1. Verificar se os servidores estão rodando

```bash
# Frontend
curl -I http://localhost:5173
# ou
curl -I http://localhost:8090

# Backend
curl http://localhost:3005
```

## 2. Teste no Navegador

### Passo a Passo:

1. **Abra o navegador**: http://localhost:5173 (ou :8090)

2. **Verifique a página inicial**
   - [ ] A página carrega sem erros?
   - [ ] O título é "Organic Code Studio"?

3. **Navegue para War Room**
   - [ ] Clique no menu "War Room"
   - [ ] A interface do WhatsApp aparece?

4. **Verifique o UltraThink**
   - [ ] UltraThink está no topo da lista?
   - [ ] Tem o badge "NEW" pulsando?
   - [ ] Está com borda azul e destaque?

5. **Teste a funcionalidade**
   - [ ] Digite: "O que é inteligência artificial?"
   - [ ] Pressione Enter ou clique em enviar

6. **Observe as respostas**
   - [ ] Aparece mensagem "Iniciando análise..."?
   - [ ] O mapa neural aparece no canto direito?
   - [ ] Os agentes começam a responder?
   - [ ] As fases progridem (1 a 5)?

## 3. Verificar Console do Navegador

Abra o console (F12) e verifique:

- [ ] Sem erros em vermelho
- [ ] WebSocket conectado: "WebSocket connection established"
- [ ] Mensagens dos agentes sendo recebidas

## 4. Teste de WebSocket via CLI

```bash
# Instalar wscat se não tiver
npm install -g wscat

# Conectar ao WebSocket
wscat -c ws://localhost:3005/warroom-ws

# Enviar mensagem de teste
{"type":"test","content":"Hello UltraThink"}
```

## 5. Teste da API diretamente

```bash
# Teste simples
curl -X POST http://localhost:3005/api/warroom/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Teste",
    "agents": ["Lead Architect"],
    "stream": false
  }'
```

## ✅ Checklist de Sucesso

- [ ] Frontend acessível
- [ ] Backend respondendo
- [ ] WebSocket conectando
- [ ] UltraThink visível e destacado
- [ ] Mapa neural funcionando
- [ ] Agentes respondendo
- [ ] 5 fases completando
- [ ] Sem erros no console

## 🔧 Problemas Comuns

1. **Página não carrega**
   - Limpar cache (Cmd+Shift+R)
   - Tentar modo incógnito
   - Verificar firewall

2. **WebSocket não conecta**
   - Verificar se backend está rodando
   - Olhar console para erros

3. **Agentes não respondem**
   - Verificar chave da API no .env
   - Verificar logs do servidor

## 📸 Screenshots esperados

1. **Tela inicial do UltraThink**
   - Lista com UltraThink no topo
   - Mensagem de boas-vindas

2. **Durante execução**
   - Mapa neural animado
   - Mensagens dos agentes
   - Barra de progresso

3. **Resultado final**
   - Síntese do Chief Strategy Officer
   - Prompt detalhado gerado