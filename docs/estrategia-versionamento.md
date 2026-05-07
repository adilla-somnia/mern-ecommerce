#### ConstructShop Inc.

# Estratégia de Versionamento

## 1. Objetivo
Estabelecer um padrão de desenvolvimento que garanta a qualidade do software, a estabilidade das funcionalidades críticas e o controle das alterações realizadas no sistema, reduzindo a exposição de erros em produção.

## 2. Modelo de Desenvolvimento
A ConstrucShop adota um fluxo de desenvolvimento baseado em **GitHub Flow**, escolhido devido à sua simplicidade e adequação ao atual nível de maturidade da equipe. Todas as alterações devem ser realizadas em branches curtas, com objetivo específico e ciclo de vida reduzido. As alterações devem ser integradas ao fluxo principal o mais rápido possível após sua conclusão, evitando divergências prolongadas entre o código em desenvolvimento e o código em produção. Sempre que houver atualizações no fluxo principal durante o desenvolvimento de uma alteração, é responsabilidade do desenvolvedor sincronizar sua ramificação antes da abertura ou conclusão do Pull Request, garantindo que conflitos sejam resolvidos de forma antecipada.

Todas as alterações no sistema devem seguir o seguinte processo:
- Desenvolvimento realizado em branches isoladas e pontuais;
- Abertura de Pull Request para integração das alterações;
- Execução obrigatória de validações automatizadas;
- Revisão de código antes da aprovação;
- Integração e disponibilização após validação completa;

Esse modelo permite controle incremental das mudanças sem introduzir complexidade operacional elevada.

## 3. Estratégia de Testes

A validação do sistema é estruturada em três níveis complementares.

### 3.1 Testes Unitários
- Responsáveis por validar regras de negócio de forma isolada.
- Foco em validações de lógica interna;
- Execução sem dependência de banco de dados;
- Utilização de mocks para:
    - MongoDB (models);
    - Redis (cache);
    - Serviços externos (pagamento e upload de imagens).

### 3.2 Testes de Integração
- Responsáveis por validar a interação entre componentes internos do sistema.
- Utilização de banco em memória quando necessário;
- Simulação de fluxos entre serviços;
- Independência de serviços externos reais.

### 3.3 Testes End-to-End (E2E)
- Responsáveis por validar o comportamento completo da aplicação.
- Execução com ambiente real da aplicação;
- Subida de serviços via containers (MongoDB e Redis);
- Execução do backend em condições próximas à produção;
- Validação de fluxos completos de usuário.

## 4. Estratégia de Dados em Testes
A utilização de banco de dados varia conforme o tipo de teste:

- Testes unitários: uso de mocks
- Testes de integração: uso de banco em memória
- Testes E2E: uso de banco em memória e mocks para fluxo completo

Essa abordagem garante equilíbrio entre desempenho, confiabilidade e fidelidade ao ambiente real.

## 5. Pipeline de Integração Contínua
Toda alteração submetida deve passar automaticamente por um pipeline de validação composto pelas seguintes etapas:
- Build da aplicação
- Execução de testes unitários
- Execução de testes de integração
- Execução de testes End-to-End

A falha em qualquer etapa interrompe o processo de integração.

## 6. Controle de Qualidade

### 6.1 Controle de Execução
Para garantir estabilidade da pipeline:
- Definição de tempo máximo por teste (15s)
- Interrupção automática de execuções que excedam limites

### 6.2 Revisão de Código
Todas as alterações devem ser revisadas antes da integração, com atenção especial para:
- Lógica de negócio
- Testes implementados
- Impacto em funcionalidades críticas

## 7. Controle de Alterações
As alterações no sistema seguem as seguintes diretrizes:
- Toda modificação deve ser realizada em uma branch isolada;
- Branches devem ser curtas, focadas em uma única mudança ou correção
- Alterações devem ser pequenas e incrementais;
- Integrações devem ocorrer com frequência, evitando acúmulo de mudanças;
- Branches devem ser sincronizadas com o fluxo principal sempre que necessário;
- Integração condicionada à aprovação e validação automática;
- Correções emergenciais seguem o mesmo fluxo de validação.

## 8. Estratégia de Deploy
- Disponibilização automática após aprovação e validação;
- Somente código validado é liberado para produção;
- O ambiente é atualizado continuamente com base nas alterações aprovadas.

## 9. Resultados Esperados
A adoção desta estratégia proporciona:
- Redução de falhas em produção;
- Maior confiabilidade em funcionalidades críticas;
- Detecção antecipada de erros;
- Padronização do processo de desenvolvimento;
- Evolução controlada da aplicação.

## 10. Padrão de Nomeação de Branches
Para padronização e rastreabilidade das alterações, as ramificações devem seguir o seguinte padrão:
- ```feature/<descricao>``` → novas funcionalidades
- ```fix/<descricao>``` → correções de bugs
- ```hotfix/<descricao>``` → correções críticas em produção

A descrição deve ser curta, objetiva e representar claramente a alteração realizada.

## 11. Política de Versionamento
A **ConstrucShop** adota o padrão Semantic Versioning (SemVer) para identificação de versões do sistema.

O versionamento segue o formato:
```MAJOR.MINOR.PATCH```

Onde:
- ```MAJOR```: alterações incompatíveis com versões anteriores
- ```MINOR```: adição de funcionalidades compatíveis
- ```PATCH```: correções de bugs sem impacto funcional

As versões devem ser atualizadas com tags a cada conjunto de alterações integradas e disponibilizadas, permitindo rastreabilidade e controle sobre a evolução do sistema.
