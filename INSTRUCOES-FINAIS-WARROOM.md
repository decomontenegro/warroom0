# 🚀 INSTRUÇÕES FINAIS - WARROOM

## 🎯 SOLUÇÃO DEFINITIVA

### Opção 1: Duplo Clique (MAIS FÁCIL)
1. **Abra o Finder**
2. **Navegue até**: `/Users/andremontenegro/teste cursor gemini e claude/organic-code-studio-unified/`
3. **Duplo clique em**: `EXECUTAR-WARROOM.command`
4. **Aguarde** abrir o Terminal e o navegador

### Opção 2: Manual no Terminal
1. **Abra o Terminal**
2. **Cole e execute**:
```bash
cd /Users/andremontenegro/teste\ cursor\ gemini\ e\ claude/organic-code-studio-unified
npm run dev
```
3. **Aguarde aparecer**: `ready in...`
4. **Abra no navegador**: http://localhost:5173/warroom

## ❌ PROBLEMA IDENTIFICADO

O erro `ERR_CONNECTION_REFUSED` acontece porque:
- O servidor foi fechado quando o comando anterior terminou
- O macOS pode estar bloqueando conexões localhost
- O processo não está mantendo o terminal aberto

## ✅ SOLUÇÃO APLICADA

1. **Criado arquivo `.command`** que:
   - Abre novo Terminal
   - Mantém servidor rodando
   - Abre navegador automaticamente

2. **Configurado Vite** para:
   - Aceitar conexões em 0.0.0.0
   - Usar 127.0.0.1 em vez de localhost

## 🎨 O QUE VOCÊ VERÁ

Quando funcionar, você verá:
- **Tema Liqi**: Cores vibrantes (roxo, azul, laranja, amarelo)
- **100+ Agentes**: Lista completa na sidebar
- **UltraThink**: No topo da lista
- **Interface WhatsApp**: Com chat moderno

## 🆘 SE AINDA NÃO FUNCIONAR

### 1. Verificar Firewall
```bash
sudo pfctl -d
```

### 2. Limpar cache DNS
```bash
sudo dscacheutil -flushcache
```

### 3. Editar /etc/hosts
```bash
sudo nano /etc/hosts
```
Adicione se não existir:
```
127.0.0.1       localhost
::1             localhost
```

### 4. Usar IP direto
Em vez de localhost, use:
- http://127.0.0.1:5173/warroom
- http://[::1]:5173/warroom

## 📱 SCREENSHOTS DO QUE ESPERAR

- Fundo escuro azulado (#0D1117)
- Botões laranja vibrante (#FF9800)
- Status em amarelo (#FDD835)
- Agentes com cores por categoria
- Gradientes modernos

---

**IMPORTANTE**: O servidor DEVE ficar rodando no Terminal. Não feche a janela do Terminal!