#### ConstructShop Inc.

# Justificativa Técnica de Estratégia DevOps

## 1. Visão Geral
A estratégia proposta para a **ConstrucShop** busca aumentar a confiabilidade das entregas, reduzir riscos operacionais e tornar o processo de desenvolvimento mais previsível. Atualmente, a empresa realiza alterações diretamente na branch principal, sem validações automatizadas, expondo funcionalidades críticas, como autenticação e pagamentos, a falhas imediatas em produção.

## 2. Controle de alterações e redução de riscos
A adoção do **GitHub Flow** estabelece um fluxo de desenvolvimento mais controlado, baseado em branches curtas, Pull Requests e integrações frequentes. Branches pequenas e merges frequentes reduzem divergências entre desenvolvimento e produção, diminuindo conflitos complexos e facilitando a identificação de problemas.

Além disso, a política de revisão obrigatória antes da integração aumenta a qualidade do código e promove compartilhamento de conhecimento entre os membros da equipe. Esse processo reduz o risco de alterações incorretas em funcionalidades críticas, como pagamentos e autenticação.

## 3. Integração contínua e feedback rápido
O pipeline automatizado proposto executa build, testes unitários, testes de integração e testes End-to-End a cada alteração submetida. Essa abordagem segue os princípios de integração contínua descritos por Jez Humble e David Farley em Continuous Delivery, onde pequenas integrações frequentes permitem detectar erros rapidamente e reduzir o custo de correção.

A automação fornece feedback rápido logo após o commit, impedindo que alterações defeituosas avancem para produção. Caso qualquer etapa falhe, o processo de integração é interrompido automaticamente, aumentando a previsibilidade das entregas.

## 4. Build reprodutível e estabilidade

A utilização de ambientes controlados, containers e gerenciamento consistente de dependências contribui para builds reprodutíveis. Essa estratégia reduz inconsistências entre ambientes de desenvolvimento e produção, eliminando problemas clássicos como “na minha máquina funciona”.

Além disso, a separação entre testes unitários, integração e E2E permite validar diferentes níveis da aplicação de maneira consistente, aumentando a confiança no deploy contínuo.

## 5. Redução de toil e alinhamento com SRE
A automação das validações reduz tarefas repetitivas e manuais, diminuindo toil operacional e permitindo que a equipe concentre esforço em melhorias de maior valor para o negócio. Esse princípio está alinhado às práticas de Site Reliability Engineering, que defendem a automação como mecanismo para aumentar confiabilidade e eficiência operacional.

No contexto da **ConstrucShop**, a adoção de práticas inspiradas em SRE é especialmente importante por se tratar de um e-commerce, onde disponibilidade e estabilidade impactam diretamente o negócio. Falhas em funcionalidades como login, carrinho ou pagamento podem interromper vendas, gerar perda de clientes e comprometer a reputação da plataforma. A utilização de automação, monitoramento e validações contínuas reduz a probabilidade de indisponibilidades em produção e aumenta a confiabilidade do sistema, garantindo uma experiência mais estável para os usuários e maior segurança operacional para a empresa.

## 6. Versionamento e previsibilidade
A adoção do Semantic Versioning (SemVer) melhora a rastreabilidade das alterações e facilita o controle da evolução do sistema. A separação entre versões MAJOR, MINOR e PATCH permite identificar rapidamente o impacto de cada atualização, aumentando a previsibilidade do processo de deploy.

De acordo com Nicole Forsgren em Accelerate, equipes que utilizam integração contínua, automação e pequenas entregas frequentes apresentam maior estabilidade e melhor desempenho operacional. Dessa forma, a estratégia proposta aproxima a **ConstrucShop** de um modelo moderno de entrega contínua, com maior segurança, controle e confiabilidade.
