# ELTRI CRM Core

Crie a fundação do ELTRI CRM, slogan “Tecnologia que integra.”

Stack: React + TypeScript, backend/API e PostgreSQL.

Arquitetura obrigatória:
Frontend → API → Serviços de domínio → Repositórios → PostgreSQL.

O sistema deve nascer multiempresa:
Organização → Empresas → Usuários → Permissões, com isolamento de dados e autorização validada no backend.

Prepare o domínio central para: Contatos, Oportunidades, Pipelines/Etapas, Atividades, Imóveis e Interesses.

Crie inicialmente:

Login

estrutura principal com sidebar e topbar

Dashboard

Contatos

Oportunidades

Pipeline

Atividades/Retornos

Imóveis

Interesses

Visual: produto profissional do ecossistema ELTRI — workspace claro, sidebar verde/teal escuro, verde ELTRI como destaque, cards discretos, tabelas limpas, tipografia moderna e consistente. Evite visual genérico/colorido de SaaS.

Não implemente ainda IA, WhatsApp, Money, Fiscal ou automações avançadas.

Primeiro estruture corretamente a aplicação e apresente a primeira versão funcional e navegável. Não invente funcionalidades fora deste escopo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9b56ef00-b45f-4b58-91c2-5cb10e799d7b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
