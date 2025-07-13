# 🌐 Como Abrir o Aplicativo

O servidor está rodando corretamente na porta 5173. Aqui estão as formas de acessar:

## Opção 1: Copiar e Colar no Navegador
Copie este endereço e cole na barra de endereços do seu navegador:
```
http://localhost:5173
```

## Opção 2: Comando Alternativo
Tente este comando no terminal:
```bash
python3 -m webbrowser http://localhost:5173
```

## Opção 3: Endereço de Rede
Se localhost não funcionar, tente:
```
http://172.24.203.80:5173
```

## Verificar se o Servidor Está Ativo
Execute este comando para confirmar:
```bash
curl http://localhost:5173
```

Se retornar HTML, o servidor está funcionando.

## Solução de Problemas

### Navegador não abre automaticamente?
- Abra manualmente seu navegador preferido
- Digite ou cole: `http://localhost:5173`
- Pressione Enter

### Página não carrega?
1. Verifique se não há firewall bloqueando
2. Tente usar outro navegador
3. Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)

### Ver logs do servidor
```bash
tail -f frontend.log
```

O aplicativo deve abrir mostrando a interface do War Room com o chat UltraThink disponível.