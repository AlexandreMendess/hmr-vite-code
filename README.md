# React HMR API Study

Projeto pessoal de estudo sobre a API de Hot Module Replacement (HMR) do Vite em uma aplicação React com TypeScript.

A ideia deste repositório é explorar, de forma prática, como o Vite atualiza módulos durante o desenvolvimento sem precisar recarregar a página inteira. O foco principal está no uso de `import.meta.hot.accept()` e `import.meta.hot.dispose()`, especialmente em cenários onde um módulo cria efeitos colaterais, como `setInterval()`.

## Objetivo

Este projeto foi criado para entender melhor o que acontece "por baixo dos panos" quando um arquivo é alterado durante o desenvolvimento com Vite.

O experimento principal está em [`src/state-hmr.ts`](src/state-hmr.ts). Nele, o módulo:

- busca dados de posts usando `axios`;
- salva informações no `localStorage`;
- cria um `setInterval()` para simular um processo contínuo;
- usa `import.meta.hot.dispose()` para limpar esse intervalo antes que o módulo seja substituído pelo HMR;
- usa `import.meta.hot.accept()` para aceitar atualizações do próprio módulo.

## O que é HMR?

HMR significa Hot Module Replacement. Em vez de recarregar a aplicação inteira quando um arquivo muda, o Vite tenta substituir apenas o módulo alterado.

Isso ajuda durante o desenvolvimento porque preserva parte do estado da aplicação e torna o feedback mais rápido.

Por exemplo, ao editar um arquivo TypeScript usado pela aplicação, o Vite pode executar novamente apenas aquele módulo e avisar o navegador sobre a atualização.

## O papel de `dispose()`

O método `dispose()` é chamado antes de um módulo ser descartado pelo HMR.

Ele é útil para limpar efeitos colaterais criados pelo módulo antigo, como:

- `setInterval`;
- `setTimeout`;
- event listeners;
- conexões WebSocket;
- subscriptions;
- dados temporários.

Neste projeto, o intervalo é criado quando o módulo carrega:

```ts
const intervalId = setInterval(() => {
  console.log("Start clean process");
}, 5000);
```

E é limpo quando o Vite substitui o módulo:

```ts
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.log("Cleaning before state");
    clearInterval(intervalId);
  });
}
```

Esse detalhe é importante: `dispose()` não deve ser usado para iniciar o efeito colateral. Ele deve ser usado para limpar algo que já foi iniciado.

Se o `clearInterval()` não for chamado, cada atualização HMR pode deixar um intervalo antigo rodando em segundo plano. Com o tempo, vários intervalos passam a executar ao mesmo tempo.

## O papel de `accept()`

O método `accept()` informa ao Vite que o módulo aceita ser atualizado via HMR.

Neste projeto:

```ts
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("Estado módulo atualizado");
  });
}
```

Esse callback roda quando o módulo recebe uma atualização. Ele ajuda a observar no console quando o HMR foi acionado.

## Como rodar

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto com a URL da API de posts:

```env
VITE_POSTS_API=https://jsonplaceholder.typicode.com/posts
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Depois, abra a URL exibida pelo Vite no terminal.

## Como testar o HMR

1. Abra o projeto no navegador.
2. Abra o console do navegador.
3. Observe os logs do `setInterval()`.
4. Edite e salve o arquivo `src/state-hmr.ts`.
5. Veja no console que o Vite atualiza o módulo.
6. Observe que o `dispose()` limpa o intervalo antigo antes do novo módulo entrar em execução.

Esse fluxo ajuda a visualizar o ciclo:

```txt
módulo carrega
  -> setInterval inicia
arquivo é alterado
  -> HMR é acionado
  -> dispose limpa o intervalo antigo
  -> módulo novo é executado
  -> novo setInterval inicia
```

## Tecnologias

- React
- TypeScript
- Vite
- Axios
- HMR API do Vite

## Observação

Este não é um projeto de produção. Ele foi feito como laboratório de aprendizado para estudar comportamento de módulos, estado temporário e efeitos colaterais durante o desenvolvimento com Vite.

Mesmo sendo simples, o projeto pode ajudar outras pessoas a entenderem uma ideia essencial: quando usamos HMR, o código do módulo pode ser executado várias vezes durante a sessão de desenvolvimento, então qualquer efeito colateral precisa ser limpo corretamente.
