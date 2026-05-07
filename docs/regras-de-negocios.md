### ConstrucShop Inc.

# Regras de Negócio

## 1. Visão Geral
ConstrucShop é um e-commerce fictício especializado em produtos de construção civil, voltado tanto para consumidores finais quanto para pequenas empresas do setor.

- Canal de vendas: Aplicativo web MERN (MongoDB, Express, React, Node.js)
- Repositório GitHub: https://github.com/empresa-ficticia/construcshop
- Estrutura do repositório:
    - Pasta frontend/: Aplicação React
    - Pasta backend/: API Node.js/Express
- Branch em deploy contínuo: master
- Status do versionamento: Atualmente, não existe política formal de versionamento, commits e merges são feitos diretamente na branch master.

## 2. Tipos de Usuário

| Tipo | Acesso | Permissões |
|----------|----------|----------|
| Público  | Sem token de auth   | Consultar produtos em destaque, por categoria e recomendações; criar conta e logar.  |
| Usuário logado  | Token de auth   | Gerenciar carrinho, iniciar checkout, aplicar cupons, ver perfil.   |
| Administrador  | Token de auth + ADM   | CRUD completo de produtos, visualizar analytics, gerenciar promoções.   |


## 3. Produtos e Catálogo
- Atributos principais: name, description, price, category, image
- Categorias exemplo: roupas, ferramentas, materiais-pesados
- Regras de negócio:
    - Produtos podem ser ativados ou desativados (PATCH /api/products/:id)
    - Produtos inativos não aparecem para usuários nem público
    - Produtos em destaque (/featured) ou recomendados (/recommendations) são escolhidos pelo admin

## 4. Jornada Simplificada do Usuário

### 4.1 Público
- Acessa a homepage e visualiza produtos em destaque.
- Filtra produtos por categoria ou vê recomendações.
- Decide criar conta (POST /api/auth/signup) ou logar (POST /api/auth/login).

### 4.2 Usuário logado
- Adiciona produtos ao carrinho (POST /api/cart), visualiza (GET /api/cart) e atualiza quantidades (PUT /api/cart/:id).
- Aplica cupom de desconto (POST /api/coupons/validate).
- Inicia pagamento (POST /api/payments/create-checkout-session).
- Após confirmação de pagamento (POST /api/payments/checkout-success), pedido é finalizado.

### 4.3 Administrador
- Cria novos produtos (POST /api/products) e atualiza existentes (PATCH /api/products/:id).
- Deleta produtos desatualizados (DELETE /api/products/:id).
- Acompanha vendas da última semana (GET /api/analytics).

## 5. Endpoints Sensíveis

| Endpoint | Método | Proteção | Regras de Negócio |
|----------|----------|----------|----------|
| /api/cart  | GET, POST, PUT, DELETE   | Token de auth |  Somente usuários logados podem manipular o carrinho. Limite de quantidade por item: 10 unidadesLimpar carrinho remove todos os itens. |
| /api/payments/create-checkout-session  | POST   | Token de auth   | Cria sessão de pagamento via Stripe. Deve receber lista de produtos e cupom opcional. |
| /api/payments/checkout-success  | POST   | Token de auth   | Confirma pagamento com sessionId. Atualiza status do pedido e estoque. |
| /api/products | POST, PATCH, DELETE | Token de auth + ADM | Somente admins podem criar, alterar ou remover produtos. PATCH usado para ativar/desativar produtos. |
| /api/analytics | GET | Token de auth + ADM | Retorna dados de vendas nos últimos 7 dias. Somente admins podem acessar. |

## 6. Regras de Preço e Promoções
- Preço mínimo para produtos: 0
- Limite máximo por pedido: 10 unidades por produto
- Promoções são aplicadas via cupom
- Vendas que somam mais de 20000 gera cupom de 10% off.
- Um usuário não pode ter mais de um cupom ativo ao mesmo tempo.

## 7. Infraestrutura do Site
A branch ```master``` do repositório GitHub [mern-ecommerce](https://github.com/empresa-ficticia/construcshop-ecommerce) está configurada para deploy contínuo, garantindo que todas as atualizações sejam refletidas diretamente no ambiente de produção.

Todas as alterações são feitas pontualmente diretamente na branch master, incluindo ajustes no frontend e backend, sem a utilização de políticas formais de versionamento ou branches de feature.

A estrutura do repositório mantém separadas as pastas frontend/ e backend/, refletindo claramente a divisão entre interface do usuário e API.
