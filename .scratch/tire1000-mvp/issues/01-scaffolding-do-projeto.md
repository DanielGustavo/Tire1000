# 01 — Scaffolding do projeto

**What to build:** A fundação de backend e frontend que os próximos tickets vão usar. Não é uma fatia demoável em si — é o prefactor que torna as fatias seguintes possíveis. Backend em TypeScript com Serverless Framework, a tabela DynamoDB única (com GSI1 e GSI2, ver spec), a convenção de caso-de-uso com injeção de dependência (repositórios/gateways injetados, handlers Lambda finos), e Vitest configurado. Frontend em React + Tailwind + Axios com roteamento básico.

**Blocked by:** None — pode começar imediatamente

**Status:** ready-for-agent

- [ ] Backend em TypeScript com Serverless Framework configurado (nenhum comando do Serverless é executado pelo agente — só escrever o `serverless.yml`)
- [ ] Recurso da tabela DynamoDB única definido no `serverless.yml`, com GSI1 e GSI2 (ver seção "Modelo de dados" do spec)
- [ ] Convenção de caso de uso com injeção de dependência estabelecida — pelo menos um caso de uso de exemplo com repositório fake e teste Vitest passando, demonstrando o padrão que os próximos tickets vão seguir
- [ ] Interfaces base de repositório/gateway definidas
- [ ] Frontend em React + Tailwind + Axios com roteamento básico e cliente de API configurado
- [ ] Convenção de pastas documentada (mesmo que brevemente) para os próximos tickets seguirem
