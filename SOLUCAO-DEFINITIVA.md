# 🚨 SOLUÇÃO DEFINITIVA - WARROOM NÃO ABRE

## 🔧 Opção 1: Script Simplificado (RECOMENDADO)

```bash
cd /Users/andremontenegro/teste\ cursor\ gemini\ e\ claude/organic-code-studio-unified
./start-simple.sh
```

## 🔧 Opção 2: Comandos Manuais

### Terminal 1 - Backend:
```bash
cd /Users/andremontenegro/teste\ cursor\ gemini\ e\ claude/organic-code-studio-unified
node server/index.js
```

### Terminal 2 - Frontend:
```bash
cd /Users/andremontenegro/teste\ cursor\ gemini\ e\ claude/organic-code-studio-unified
npx vite --host 0.0.0.0 --port 5173
```

## 🔧 Opção 3: Usar Python (Se nada funcionar)

```bash
cd /Users/andremontenegro/teste\ cursor\ gemini\ e\ claude/organic-code-studio-unified
python3 -m http.server 8080
```

Depois abra: http://localhost:8080/

## 🔍 Verificar se está funcionando:

1. **Teste o backend**:
   ```bash
   curl http://localhost:3005/api/health
   ```

2. **Teste o frontend**:
   ```bash
   curl http://localhost:5173/
   ```

## 🚫 Se ainda não funcionar:

### 1. Verificar Firewall:
```bash
sudo pfctl -d  # Desabilita temporariamente o firewall
```

### 2. Verificar arquivo hosts:
```bash
cat /etc/hosts | grep localhost
```
Deve mostrar:
```
127.0.0.1       localhost
```

### 3. Limpar DNS:
```bash
sudo dscacheutil -flushcache
```

### 4. Usar servidor Node simples:
```bash
cd /Users/andremontenegro/teste\ cursor\ gemini\ e\ claude/organic-code-studio-unified
npx serve -p 8080
```

## 🎯 URLs para testar (na ordem):

1. http://127.0.0.1:5173/warroom
2. http://localhost:5173/warroom
3. http://0.0.0.0:5173/warroom
4. http://[::1]:5173/warroom (IPv6)

## 💡 Última alternativa:

Se NADA funcionar, crie um arquivo HTML simples:

```bash
echo '<h1>Teste</h1>' > test.html
open test.html
```

Se nem isso abrir, o problema é no navegador ou sistema.