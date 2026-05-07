#### ConstrucShop Inc.

# Mapa de Testes

## 1. Objetivo
Documentar os detalhes de cada teste de validação existentes para cada módulo da aplicação, garantindo rastreabilidade e evitando duplicação de testes.

## 2. Estratégia geral de organização

- Testes unitários: validação de regras isoladas (sem banco e sem dependências externas)
- Testes de integração: validação de fluxos internos entre módulos
- Testes E2E: validação de jornadas completas do usuário

Cada cenário deve ser testado no nível mais baixo possível para evitar redundância

## 3. Auth

### 3.1 Auth endpoints - Integration tests:
- 1. should signup, login, access profile and logout: cobre o fluxo completo de autenticação, incluindo registro de usuário, login, acesso ao perfil protegido e logout.

- 2. should not allow duplicate signup but allow login with original user: garante que não seja possível criar usuários duplicados com o mesmo email, mas que o login do usuário original continue funcionando normalmente.

### 3.2 Auth endpoints - Login unit tests:

- 1. should login an existing user and set authentication cookies: valida que um usuário existente consegue logar com sucesso e que os cookies de autenticação são corretamente definidos.
- 2. should not login with incorrect password: garante que o login falhe se a senha fornecida estiver incorreta.
- 3. should not login with non-existing email: garante que o login falhe se o email não existir no sistema.
- 4. should not login with missing fields: verifica que o login falha se algum campo obrigatório estiver ausente na requisição.

### 3.3 Auth endpoints - Logout unit tests:
- 1. should logout a logged-in user and clear authentication cookies: valida que um usuário logado consegue fazer logout com sucesso e que os cookies de autenticação são limpos.
- 2. should logout even if user is not logged in: garante que a rota de logout pode ser chamada mesmo sem um usuário logado, retornando sucesso e limpando cookies se existirem.

### 3.4 Auth endpoints - Profile unit tests:

- 1. should access profile with valid token: valida que um usuário com token válido consegue acessar seu perfil, e que a senha não é retornada na resposta.
- 2. should not access profile with invalid token: garante que o acesso ao perfil falha se o token fornecido for inválido, retornando erro 401.
- 3. should not access profile without token: garante que o acesso ao perfil falha se nenhum token for enviado, retornando erro 401.

### 3.5 Auth endpoints - Admin access control unit tests:
- 1. should allow access to admin route for admin user: valida que um usuário com role "admin" consegue acessar uma rota protegida para administradores.
- 2. should deny access to admin route for non-admin user: garante que um usuário comum (role "customer") não consegue acessar uma rota de administrador, retornando erro 403.

### 3.6 Auth endpoints - Signup unit tests:
- 1. should signup a new user with default customer: cria um usuário com sucesso, garantindo que o role padrão seja "customer".
- 2. should not signup a new user with invalid email: valida que emails inválidos retornam erro 400.
- 3. should not signup a new user with missing fields: garante erro ao faltar algum campo obrigatório.
- 4. should not signup a new user with short password: verifica que senhas curtas são rejeitadas.
- 5. should not signup a new user with existing email: impede signup duplicado de email.
- 6. should ignore unexpected fields in signup: ignora campos inesperados (como role) e mantém role padrão.
- 7. should store hashed password in database: confirma que a senha é armazenada criptografada no banco.

## 4. CART
### 4.1 Cart Controller:

- GET /api/cart
    - should return empty cart initially: verifica que o carrinho começa vazio para o usuário.

- POST /api/cart
    - should fail if productId is missing: retorna erro 400 se productId não for enviado.
    - should add a product to the cart: adiciona um produto ao carrinho e valida que a quantidade padrão é 1.
- PUT /api/cart/:id
    - should update product quantity in the cart: atualiza a quantidade de um item existente no carrinho.
    - should fail with invalid product id: retorna 404 se o ID do item do carrinho for inválido.

- DELETE /api/cart
    - should remove all items from the cart: remove todos os produtos do carrinho.

## 5. COUPONS
### 5.1 Coupon Controller:

- GET /api/coupons
    - should return user's coupons: retorna os cupons ativos do usuário autenticado.
    - should fail if user is not authenticated: retorna 401 se não houver autenticação.

- POST /api/coupons/validate
    - should validate a correct coupon: valida corretamente um cupom existente e ativo.
    - should reject an invalid coupon: retorna 404 para um cupom inexistente.
    - should reject a coupon from another user: retorna 404 se o cupom pertence a outro usuário.
    - should fail if user is not authenticated: retorna 401 se não houver autenticação.
    - should reject an expired coupon: retorna 404 se o cupom estiver expirado.

## 6. PAYMENT
### 6.1 Coupon integration via Payment:

- POST /api/payments/create-checkout-session
    - should apply valid coupon and send discount to Stripe session: verifica que um cupom válido é aplicado corretamente e enviado à sessão do Stripe.
    - should not apply discount when coupon is invalid: garante que um cupom inválido não gera desconto na sessão do Stripe.

### 6.2 Payment Controller:

- POST /api/payments/create-checkout-session
    - should create a checkout session without coupon: cria uma sessão de checkout sem aplicar cupom.
    - should create a checkout session with coupon: cria uma sessão de checkout com cupom válido e garante que o desconto seja aplicado.
    - should fail with empty products: falha ao tentar criar sessão de checkout sem produtos.

- POST /api/payments/checkout-success
    - should complete checkout successfully: finaliza o checkout corretamente e cria uma Order no banco.
    - should fail with invalid sessionId: falha ao tentar finalizar o checkout com sessionId inválido.

## 7. PRODUCTS
### 7.1 Product endpoints - DELETE:
- should delete an existing product: deleta um produto existente com usuário admin.
- should not let customers delete products: impede que um usuário comum (customer) delete produtos.
- should not delete a non existing product: retorna erro ao tentar deletar um produto que não existe.
- should not delete an undefined product id: retorna erro ao tentar deletar um produto sem id definido.

### 7.2 Product endpoints - GET:
- should get featured products when it's empty: retorna lista vazia de produtos em destaque quando não há nenhum.
- should get featured products when there are itens: retorna produtos em destaque quando existem itens marcados como `isFeatured`.
- should get products by category when it's empty: retorna lista vazia ao buscar produtos por uma categoria sem itens.
- should get products by category: retorna produtos de uma categoria existente.
- should get recommended products of length 4: retorna 4 produtos recomendados (recommendations).

### 7.3 Product Integration - POST/PATCH/DELETE/GET:
- should create, patch, delete a product and not find in with GET: cria um produto, atualiza (PATCH), deleta e confirma que não aparece mais ao buscar por categoria.

### 7.4 Product PATCH - Feature Product:
- should mark a product as featured: marca e desmarca um produto como destaque (admin) com sucesso.
- should fail to mark a product as featured if user is not admin: usuário comum não consegue marcar produto como destaque (403).
- should fail to mark a product as featured with invalid id: falha ao usar ID inválido (400).
- should fail to mark a product as featured without an id: falha ao não passar ID (404).
- should fail to mark a product as featured if it doesn't exist: falha ao tentar destacar produto inexistente (404).

### 7.5 Product POST - Create Product:
- should create a new product as an admin: cria um produto com sucesso, atribuindo `isFeatured = false` e validando imagem, preço e categoria.
- should fail to create a product as a non-admin: usuários comuns não conseguem criar produtos (403).
- should fail to create a product with missing fields: falha se campos obrigatórios estiverem ausentes (400).
- should fail to create a product with negative price: falha se o preço for negativo (400).
- should fail to create a product with invalid data types: falha se tipos de dados estiverem incorretos, como preço em string (400).

## 8. E2E
### 8.1 E2E - Fluxo completo do usuário (happy path)
- Cobre o ciclo de uso real do sistema desde a perspectiva de um usuário comum (customer):
- Criação de usuário via signup
- Login e autenticação
- Adição de produto ao carrinho
- Criação de sessão de checkout (mock Stripe)
- Finalização do pagamento e criação do pedido
- Verificação de que o pedido está associado corretamente ao usuário e aos produtos
- Testa integração entre múltiplos módulos: usuários, produtos, pedidos e pagamentos

