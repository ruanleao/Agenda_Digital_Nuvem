# Agenda Digital - Gerenciamento de Contatos

Este é um aplicativo web para gerenciamento de contatos (CRUD completo) integrado a um banco de dados na nuvem.

## Tecnologias Utilizadas
* **Frontend:** HTML, CSS e JavaScript nativo.
* **Plataforma Nuvem (BaaS):** Google Firebase (banco de dados Cloud Firestore).

## Como rodar o projeto localmente
1. Baixe ou clone os arquivos do repositório.
2. Certifique-se de que os arquivos `index.html`, `style.css` e `app.js` estão na mesma pasta.
3. Abra o arquivo `index.html` utilizando um servidor local (como a extensão **Live Server** do VS Code) para que os módulos do Firebase carreguem corretamente no navegador.

## Validações e Segurança Implementadas

### Na Camada da Aplicação (Frontend)
Para evitar a entrada de "lixo" no banco de dados, os inputs possuem filtros em tempo real:
* **Nome:** Aceita apenas letras e espaços (bloqueia números e caracteres especiais).
* **Telefone:** Aceita apenas números e os símbolos `+`, `-`, `()` e espaços. Possui limite máximo de 19 caracteres.
* **Data de Nascimento:** Bloqueia anos irreais com mais de 4 dígitos e impede o cadastro de datas futuras.

### No Banco de Dados (Firebase Security Rules)
As regras do Firestore foram configuradas manualmente para garantir a segurança:
* **Isolamento:** Apenas a coleção `contatos` está exposta; qualquer outra tentativa de acesso ao banco é bloqueada.
* **Integridade:** O banco só aceita inserções ou edições se os campos `nome`, `telefone` e `email` forem enviados como strings válidas.
* **Proteção contra Exclusão em Massa:** O comando de deletar exige obrigatoriamente o ID específico do documento, impedindo scripts maliciosos de apagarem a coleção inteira de uma vez.