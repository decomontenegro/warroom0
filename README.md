# 🚀 Organic Code Studio Unified

Uma aplicação unificada e limpa para visualização e análise de código usando DAG (Directed Acyclic Graph).

## 🎯 Visão Geral

Este projeto é uma reconstrução completa do Organic Code Studio, focando em:
- **UX Simplificada**: Apenas 2 views principais (DAG e War Room)
- **Design Consistente**: Um único design system em toda aplicação
- **Performance**: Arquitetura otimizada e unificada
- **Foco no Usuário**: Interface intuitiva e responsiva

## 🏗️ Arquitetura

```
organic-code-studio-unified/
├── src/                    # Frontend React
│   ├── components/        
│   │   ├── dag/           # Visualizador DAG principal
│   │   ├── warroom/       # Interface War Room
│   │   └── common/        # Componentes compartilhados
│   ├── styles/            # CSS e design system
│   └── utils/             # Utilitários
├── server/                # Backend Express
│   ├── routes/            # Rotas API
│   └── services/          # Lógica de negócios
└── public/                # Assets estáticos
```

## 🚀 Como Executar

### Opção 1: Script Unificado (Recomendado)
```bash
./start-unified.sh
```

### Opção 2: Comandos Separados
```bash
# Terminal 1 - Backend
cd server
node index.js

# Terminal 2 - Frontend
npm run dev:client
```

### Acessar:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3005

## ✨ Funcionalidades

### DAG View (Principal)
- Visualização interativa de dependências de código
- Múltiplos layouts (hierárquico, circular, força)
- Filtros por tipo de nó
- Métricas em tempo real
- Animações suaves

### War Room (Opcional)
- Análise colaborativa com AI
- Sessões de revisão de código
- Integração com personas AI
- Ativado apenas quando necessário

## 🎨 Design System

- **Tema**: Dark mode elegante
- **Cores**: Paleta consistente e acessível
- **Tipografia**: Inter para UI, Monaco para código
- **Animações**: Transições suaves e responsivas

## 🔧 Tecnologias

- **Frontend**: React + Vite + D3.js
- **Backend**: Node.js + Express
- **Visualização**: D3.js v7
- **Estilização**: CSS Modules
- **Build**: Vite

## 📝 API Endpoints

### DAG API
- `GET /api/dag/analyze` - Analisar código/projeto
- `GET /api/dag/graph/:id` - Obter grafo específico
- `GET /api/dag/metrics/:id` - Métricas do grafo

### War Room API
- `POST /api/tasks` - Criar nova sessão
- `GET /api/tasks/:id` - Obter sessão
- `PUT /api/tasks/:id` - Atualizar sessão

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.