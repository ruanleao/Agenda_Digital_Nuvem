# Agenda Digital — Gerenciamento de Contatos

**Disciplina:** Aplicação de Banco de Dados
**Atividade:** Desenvolvimento de Aplicação em Nuvem (3 pontos)
**Modalidade:** Individual
**Aluno:** Ruan William Leão dos Santos

---

## Pré-requisitos e Diretrizes

* O código-fonte está hospedado neste repositório público no GitHub.
* O arquivo principal `index.html` está na raiz do projeto.
* O deploy foi realizado via **GitHub Pages**: https://ruanleao.github.io/Agenda_Digital_Nuvem/
* Nenhuma chave administrativa ou secreta foi exposta — apenas a configuração pública padrão do Firebase SDK.

---

## Contextualização e Objetivo

No cenário atual do desenvolvimento de software, a computação em nuvem permite que aplicações sejam construídas de forma mais ágil utilizando serviços de **BaaS (Backend as a Service)**. Esses serviços gerenciam a infraestrutura de banco de dados e backend, permitindo que o desenvolvedor foque na interface e nas regras de negócio.

Este projeto assume o papel de um **desenvolvedor Full Stack iniciante** que constrói um aplicativo web de **Agenda Digital**, integrando uma interface estática de cliente a um banco de dados hospedado na nuvem.

---

## Comando da Questão

A aplicação foi desenvolvida utilizando **HTML5, CSS3 e JavaScript nativo (Vanilla JS)** no lado do cliente, integrada ao **Google Firebase** com o banco de dados NoSQL **Cloud Firestore** para persistência dos dados.

### Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla JS) |
| Backend/BaaS | Google Firebase — Cloud Firestore (NoSQL) |
| SDK | Firebase v10 Modular via CDN |
| Hospedagem | GitHub Pages |
| Versionamento | Git + GitHub |

### Estrutura de Arquivos

```
/
├── index.html       → Estrutura da página (formulário, busca, tabela)
├── style.css        → Estilização responsiva com efeitos visuais
├── app.js           → Lógica de negócio, validações e integração com Firebase
├── firestore.rules  → Regras de segurança do Firestore (versionadas)
└── README.md        → Documentação do projeto
```

### Funcionalidades (CRUD)

* **Criar (Create):** Formulário com campos de nome, telefone, e-mail, data de nascimento e observações. Ao salvar, executa `addDoc()` para inserir um novo documento no Firestore.
* **Ler (Read):** Utiliza `onSnapshot()` para escutar alterações no banco em tempo real e renderizar a tabela automaticamente, sem recarregar a página.
* **Atualizar (Update):** O mesmo formulário de criação é reutilizado para edição. Um campo `hidden` guarda o ID do contato — quando preenchido, o botão Salvar executa `updateDoc()` em vez de `addDoc()`.
* **Excluir (Delete):** Botão de lixeira ao lado de cada contato que exibe um `confirm()` de confirmação antes de executar `deleteDoc()`.
* **Buscar:** Filtro local em tempo real que percorre uma cópia dos dados mantida pelo `onSnapshot`, sem fazer novas consultas ao banco.

### Como Rodar Localmente

1. Clone ou baixe os arquivos do repositório.
2. Abra o arquivo `index.html` utilizando um servidor local (como a extensão **Live Server** do VS Code) para que os módulos ES6 do Firebase carreguem corretamente.

---

## Requisitos de Segurança e Boas Práticas

Como a aplicação é executada inteiramente no navegador (Frontend), as credenciais de conexão ficam visíveis no código-fonte. Para proteger a aplicação e o banco de dados, foram implementadas **três camadas de segurança**:

### Camada 1 — Validações do Frontend (`app.js`)

Para evitar a entrada de dados inválidos no banco, os campos possuem filtros em tempo real:

* **Nome:** Expressão regular `replace(/[^a-zA-ZÀ-ÿ\s]/g, "")` remove números e caracteres especiais durante a digitação, aceitando apenas letras (incluindo acentuadas) e espaços.
* **Telefone:** Expressão regular `replace(/[^0-9()+\-\s]/g, "")` bloqueia letras, permitindo apenas números e os símbolos `+`, `-`, `(`, `)` e espaço. Limite máximo de 19 caracteres (`maxlength`).
* **Data de Nascimento:** Os atributos `min` e `max` do campo `<input type="date">` são definidos via JavaScript — `max` é a data de hoje (impede datas futuras) e `min` é `1900-01-01` (impede anos irreais).
* **E-mail:** Validação nativa do HTML5 com `<input type="email" required>`.

### Camada 2 — Regras de Segurança do Firestore (Security Rules)

As regras foram configuradas manualmente no Console do Firebase (e versionadas no arquivo `firestore.rules`):

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /contatos/{contatoId} {
      allow read: if true;

      allow create, update: if request.resource.data.nome is string
                            && request.resource.data.telefone is string
                            && request.resource.data.email is string;

      allow delete: if true;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

| Regra | O que faz |
|---|---|
| `allow read: if true` | Permite leitura pública da coleção `contatos` (necessário pois o app não possui autenticação) |
| `allow create, update: if ... is string` | Garante integridade — rejeita documentos se `nome`, `telefone` ou `email` não forem strings válidas |
| `allow delete: if true` | Permite exclusão individual por ID (o Firestore já exige um ID específico no path, impedindo exclusão em massa pelo SDK) |
| `match /{document=**} { if false }` | Bloqueia completamente o acesso a qualquer coleção que não seja `contatos` |

### Camada 3 — Restrição da API Key (Google Cloud Console)

A chave de API pública foi restrita via **Referenciadores HTTP** no Google Cloud Console, aceitando requisições apenas dos seguintes domínios:

* `http://localhost/*` e `http://localhost:5500/*`
* `http://127.0.0.1/*` e `http://127.0.0.1:5500/*`
* `https://ruanleao.github.io/Agenda_Digital_Nuvem/*`

Essa restrição impede que a chave seja utilizada indevidamente a partir de domínios não autorizados para consumir recursos do projeto.

---

## Passo a Passo Técnico Resumido

1. Criação do projeto no **Firebase Console** e ativação do **Cloud Firestore**.
2. Configuração da coleção `/contatos/{contatoId}` com os campos: `nome`, `email`, `telefone`, `obs` e `dtNascimento`.
3. Desenvolvimento do frontend com HTML5 semântico, CSS3 responsivo e JavaScript nativo.
4. Integração via **Firebase SDK v10 Modular** (importações CDN com `import { ... } from "https://www.gstatic.com/firebasejs/10.8.0/..."`)
5. Implementação do CRUD: `addDoc()`, `onSnapshot()`, `updateDoc()`, `deleteDoc()`.
6. Adição de validações em tempo real nos campos do formulário.
7. Configuração das **Security Rules** no Console do Firebase com validação de tipo e isolamento de coleção.
8. Restrição da **API Key** por referenciadores HTTP no Google Cloud Console.
9. Versionamento com **Git** e hospedagem do código no **GitHub**.
10. Deploy da aplicação via **GitHub Pages**.
