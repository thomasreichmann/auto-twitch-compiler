# Auto Twitch compiler

Esse repo contém o back-end do projeto, sendo um servidor usando express que pega os canais criados na front-end da firestore(noSQL), o servidor expõe apenas um endpoint `GET /refresh` que força o servidor a atualizar a data local com a firebase.

# Front end

A front end escrita em `tsx` com React pode ser encontrada nesse [Repo](https://github.com/thomasreichmann/auto-twitch-compiler-web)

Os dois repos foram feitos para rodar em conjunto, com a front end provendo um local para criar e editar os canais e a back end processando os canais e gerando os vídeos.

## Desenvolvimento local

-   Clone o repositório localmente
-   Rode `yarn i` para baixar as dependências do projeto
-   Crie um arquivo `.env` com o formato descrito em [.env.example](.env.example)
-   Rode `yarn start` para iniciar o server express em port `3000`

#### Integração com Firebase

O projeto foi criado com firestore em mente como database, em teoria ele pode ser modificado para permitir outras formas de armazenamento para os canais.

É necessário um arquivo de configuração do firebase `auth.json` no caminho `src/firebase/` esse arquivo pode ser pego no painel de configuração do projeto no firebase.
