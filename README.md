# Herbário da Universidade Tecnológica Federal do Paraná Campus Campo Mourão

## Instalação e execução em ambiente local

Baixe o projeto, faça a instalação das dependências com o comando `yarn install` e a execução com o comando `yarn start`.

No terminal, uma mensagem com o endereço será exibida, basta copiar e colar em seu navegador.

---

O projeto está configurado com alguns hooks do Git.

- Quando fizer um _commit_, o script `yarn lint` é executado, validando se o código não possui erros de TypeScript e está no padrão definido nas regras de lint. Caso seu commit não seja bem sucedido, verifique o terminal para mais informações do que está impedindo a ação de ser completada.

- Quando fizer _push_ das modificações, o script `yarn test` é executado, validando se todos os testes do projeto estão passando. Caso o comando falhe, a mesma dica do item acima é válido.
