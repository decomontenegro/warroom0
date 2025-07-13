# Instalação das Dependências 3D

Para usar a visualização 3D, você precisa instalar as seguintes dependências:

## Opção 1: Comando direto
Execute no terminal na pasta do projeto:

```bash
npm install three@0.158.0 @react-three/fiber@8.15.0 @react-three/drei@9.88.0
```

## Opção 2: Script de instalação
Execute o script criado:

```bash
./install-3d.sh
```

## Opção 3: Instalação manual
Adicione manualmente ao package.json e execute `npm install`:

```json
"three": "^0.158.0",
"@react-three/fiber": "^8.15.0",
"@react-three/drei": "^9.88.0"
```

## Após a instalação
Reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

A visualização 3D estará disponível no toggle 2D/3D do DAG View.