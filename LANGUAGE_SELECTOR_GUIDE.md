# 🌐 Guia Visual - Seletor de Idioma UltraThink

## Onde Encontrar o Seletor de Idioma

### 1. Acesse o Chat UltraThink
- Na sidebar esquerda, clique em **"🚀 UltraThink Workflow"** (primeiro item)

### 2. Localização do Seletor
O seletor de idioma aparece no **canto superior direito** da tela quando você está no chat UltraThink.

```
┌─────────────────────────────────────────────────┐
│ 🚀 UltraThink Workflow                          │
│                                    [🇧🇷 pt-BR ▼] │ ← SELETOR AQUI
│                                                 │
│ Mensagens do chat...                            │
│                                                 │
│                          [📊 Mostrar Métricas]  │ ← Botão métricas
└─────────────────────────────────────────────────┘
```

### 3. Visual do Seletor
- **Aparência**: Botão com bandeira e código do idioma
- **Exemplo**: 🇧🇷 pt-BR ▼
- **Ao clicar**: Menu dropdown com todos os idiomas

### 4. Se Não Estiver Aparecendo

#### Verifique:
1. **Você está no chat UltraThink?** (não funciona em outros chats)
2. **A página foi recarregada?** (Pressione F5)
3. **Limpe o cache** (Ctrl+Shift+R ou Cmd+Shift+R)

#### Teste Rápido:
1. Abra o console do navegador (F12)
2. Digite: `document.querySelector('.language-selector')`
3. Se retornar null, há um problema de renderização

### 5. Estrutura dos Controles

No chat UltraThink, você verá:

```
        ┌──────────────────┐
        │ 🇧🇷 pt-BR ▼      │  ← Seletor de Idioma
        └──────────────────┘
        
        ┌──────────────────┐
        │ 📊 Mostrar       │  ← Botão de Métricas
        │    Métricas      │     (aparece após análise)
        └──────────────────┘
```

### 6. Como Usar

1. **Clique no seletor** (🇧🇷 pt-BR ▼)
2. **Menu abre** com opções:
   - 🇧🇷 Português (Brasil) ✓
   - 🇺🇸 English (US)
   - 🇪🇸 Español
   - 🇫🇷 Français
   - etc...
3. **Clique no idioma** desejado
4. **Pronto!** Próximas análises usarão o novo idioma

### 7. Dicas

- O idioma é salvo automaticamente
- Afeta apenas novas análises
- Análises anteriores mantêm o idioma original
- Mudança é instantânea, sem necessidade de recarregar

### 8. Troubleshooting

Se ainda não conseguir ver:
1. Feche todas as abas do aplicativo
2. Abra uma nova aba
3. Acesse http://localhost:5173
4. Navegue para UltraThink
5. O seletor deve aparecer no canto superior direito