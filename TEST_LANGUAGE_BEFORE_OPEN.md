# 🧪 Teste do Sistema de Idiomas - Escolher ANTES de Abrir

## Instruções Passo a Passo

### 1. Preparação (Feche Tudo Primeiro)
```bash
# 1. Feche todas as abas do navegador com o sistema
# 2. Pare e reinicie o servidor (Ctrl+C e npm run dev:server)
```

### 2. Definir Idioma ANTES de Abrir

#### Opção A: Via Console do Navegador
1. Abra uma nova aba no navegador
2. Vá para http://localhost:5173 (mas NÃO entre no /warroom ainda)
3. Abra o Console (F12)
4. Execute um dos comandos abaixo:

```javascript
// Para inglês
localStorage.setItem('warroom-language', 'en-US');
console.log('✅ Language set to English');

// Para espanhol
localStorage.setItem('warroom-language', 'es-ES');
console.log('✅ Language set to Spanish');

// Para português (padrão)
localStorage.setItem('warroom-language', 'pt-BR');
console.log('✅ Language set to Portuguese');
```

5. AGORA navegue para http://localhost:5173/warroom

#### Opção B: Via Página de Configuração
1. Abra http://localhost:5173/debug-language.html
2. Clique no botão do idioma desejado
3. Verifique no localStorage que foi salvo
4. Abra http://localhost:5173/warroom em NOVA ABA

### 3. Verificação

O sistema deve iniciar com:
- ✅ Mensagens de boas-vindas no idioma escolhido
- ✅ Interface do UltraThink traduzida
- ✅ Console mostrando: "🌍 Initializing i18n with language: [seu idioma]"

### 4. Teste o UltraThink

Com o idioma já configurado, digite uma mensagem:

**Inglês:**
```
help me build a DeFi trading platform
```

**Espanhol:**
```
ayúdame a crear una plataforma de trading DeFi
```

**Português:**
```
me ajude a criar uma plataforma de trading DeFi
```

### 5. O que Observar

- As fases do UltraThink devem aparecer no idioma escolhido
- As respostas dos agentes devem estar no idioma correto
- O Chief Strategy Officer deve responder no idioma selecionado

## Script de Teste Rápido

Cole isso no console ANTES de abrir o sistema:

```javascript
// Teste rápido - muda idioma e abre em nova aba
function testLanguageBeforeOpen(lang) {
  localStorage.setItem('warroom-language', lang);
  console.log(`✅ Language set to ${lang}`);
  console.log('📍 Opening WarRoom in 2 seconds...');
  setTimeout(() => {
    window.open('http://localhost:5173/warroom', '_blank');
  }, 2000);
}

// Use assim:
testLanguageBeforeOpen('en-US'); // ou 'es-ES' ou 'pt-BR'
```

## Verificação no Console

Após abrir o sistema, no console você deve ver:
```
🌍 Initializing i18n with language: en-US
✅ i18n initialized with: en-US
🌍 Initializing i18n with language: en-US
```

## Solução de Problemas

Se ainda aparecer em português:
1. Limpe o cache: `localStorage.clear()`
2. Defina o idioma novamente
3. Faça hard refresh (Ctrl+Shift+R)
4. Abra em aba anônima/privada