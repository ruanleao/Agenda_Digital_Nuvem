// Importações do SDK do Firebase via CDN 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCLUMB5fESHonWaQMH-QX5lbOvFOj7joPU",
  authDomain: "agenda-digital-80d70.firebaseapp.com",
  projectId: "agenda-digital-80d70",
  storageBucket: "agenda-digital-80d70.firebasestorage.app",
  messagingSenderId: "978325514475",
  appId: "1:978325514475:web:827e62f43f58c34de476ae"
};

// Inicialização do Firebase e do Cloud Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const contatosCollection = collection(db, "contatos");

// Referências dos Elementos HTML
const tabelaContatos = document.getElementById("tabelaContatos");
const formContato = document.getElementById("formContato");
const formTitulo = document.getElementById("formTitulo");
const contatoIdInput = document.getElementById("contatoId");
const nomeInput = document.getElementById("nome");
const telefoneInput = document.getElementById("telefone");
const emailInput = document.getElementById("email");
const obsInput = document.getElementById("obs");
const dtNascimentoInput = document.getElementById("dtNascimento");
const buscaNomeInput = document.getElementById("buscaNome");
const btnBuscar = document.getElementById("btnBuscar");
const btnNovo = document.getElementById("btnNovo");
const btnCancelar = document.getElementById("btnCancelar");


// VALIDAÇÕES EM TEMPO REAL E LIMITES DOS CAMPOS    

// 1. Impede a digitação de números e caracteres especiais no campo Nome
nomeInput.addEventListener("input", function(e) {
    // Remove tudo que NÃO (^) for letra (incluindo acentuadas) ou espaço
    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
});

// 2. Telefone: Permite apenas números e símbolos específicos, e limita o tamanho
// Define o limite máximo de 19 caracteres (ex: "+55 (99) 99999-9999")
telefoneInput.setAttribute("maxlength", "19"); 

telefoneInput.addEventListener("input", function(e) {
    // Remove tudo que NÃO (^) for número ou os símbolos permitidos
    this.value = this.value.replace(/[^0-9()+\-\s]/g, "");
});

// 3. Trava o calendário para aceitar apenas anos lógicos (4 dígitos) e impede datas futuras
const hoje = new Date().toISOString().split("T")[0]; 
dtNascimentoInput.setAttribute("max", hoje);
dtNascimentoInput.setAttribute("min", "1900-01-01");

// Variável local para manter uma cópia dos dados e permitir a busca
let listaContatosLocal = [];

// ==========================================================================
// 1. LEITURA EM TEMPO REAL (onSnapshot)
// ==========================================================================
onSnapshot(contatosCollection, (snapshot) => { // Atualiza a lista local sempre que houver mudanças no Firestore
    listaContatosLocal = []; 
    snapshot.forEach((doc) => { 
        listaContatosLocal.push({ // Cria um objeto com o ID do documento e seus dados
            id: doc.id,
            ...doc.data()
        });
    });
    renderizarTabela(listaContatosLocal); // Mostra a tabela atualizada
});

// Função para construir as linhas da tabela
function renderizarTabela(dados) {
    tabelaContatos.innerHTML = ""; 

    if (dados.length === 0) {
        tabelaContatos.innerHTML = `<tr><td colspan="7" style="text-align:center;">Nenhum contato encontrado.</td></tr>`;
        return;
    }

    dados.forEach((contato) => {
    const tr = document.createElement("tr");

    // Inverte o formato YYYY-MM-DD para DD/MM/YYYY de forma limpa
    let dataFormatada = "";
    if (contato.dtNascimento) {
        const partes = contato.dtNascimento.split("-"); // [ano, mes, dia]
        dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    // Monta a linha da tabela com os dados do contato e exibe os primeiros 6 caracteres do ID para referência
    tr.innerHTML = `
        <td><code>${contato.id.substring(0, 6)}...</code></td> 
        <td>${contato.nome}</td> 
        <td>${contato.telefone}</td>
        <td>${contato.email}</td>
        <td>${dataFormatada}</td>
        <td>${contato.obs || ''}</td>
        <td>
            <button class="btn-acao btn-editar" data-id="${contato.id}" title="Editar">✏️</button> 
            <button class="btn-acao btn-excluir" data-id="${contato.id}" title="Excluir">🗑️</button>
        </td>
    `;

    tr.querySelector(".btn-editar").addEventListener("click", () => carregarFormularioEdicao(contato)); // Passa o objeto completo do contato para a função de edição
    tr.querySelector(".btn-excluir").addEventListener("click", () => eliminarContato(contato.id, contato.nome)); // Passa o nome do contato para exibir na confirmação de exclusão

    tabelaContatos.appendChild(tr); 
});
}

// ==========================================================================
// 2. OPERAÇÃO: SALVAR (Inserção / Atualização)
// ==========================================================================
formContato.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = contatoIdInput.value; 
    const dadosContato = {
    nome: nomeInput.value.trim(), // Remove espaços extras no início e no fim
    telefone: telefoneInput.value.trim(), 
    email: emailInput.value.trim(),  
    obs: obsInput.value.trim(),  
    dtNascimento: dtNascimentoInput.value // Salva a string pura no formato "YYYY-MM-DD" no Firestore
};
    
    try {
        if (id === "") {
            // Cria um novo registro
            await addDoc(contatosCollection, dadosContato); // O Firestore gera automaticamente um ID único
        } else {
            // Atualiza um registro existente
            const docRef = doc(db, "contatos", id);
            await updateDoc(docRef, dadosContato); 
        }
        limparFormulario(); 
    } catch (error) {
        console.error("Erro ao salvar dados: ", error);
        alert("Erro ao processar a operação no banco de dados.");
    }
});

// ==========================================================================
// 3. OPERAÇÃO: EXCLUIR
// ==========================================================================
async function eliminarContato(id, nome) {
    const confirmacao = confirm(`Tem certeza que deseja excluir o contato "${nome}"?`);
    if (confirmacao) {
        try {
            const docRef = doc(db, "contatos", id); 
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Erro ao excluir: ", error);
            alert("Não foi possível excluir o contato.");
        }
    }
}

// ==========================================================================
// 4. OPERAÇÃO: CARREGAR PARA EDIÇÃO
// ==========================================================================
function carregarFormularioEdicao(contato) { 
    formTitulo.textContent = "Editar Contato";
    contatoIdInput.value = contato.id;
    nomeInput.value = contato.nome;
    telefoneInput.value = contato.telefone;
    emailInput.value = contato.email;
    obsInput.value = contato.obs || "";
    dtNascimentoInput.value = contato.dtNascimento || ""; // Preenche o calendário nativo corretamente
    nomeInput.focus();
}

// ==========================================================================
// 5. OPERAÇÃO: BUSCAR
// ==========================================================================
btnBuscar.addEventListener("click", () => {
    const termoBusca = buscaNomeInput.value.trim().toLowerCase(); 
    
    if (termoBusca === "") { 
        renderizarTabela(listaContatosLocal); 
    } else {
        const filtrados = listaContatosLocal.filter(contato => 
            contato.nome.toLowerCase().includes(termoBusca) // Busca parcial e case-insensitive  
        );
        renderizarTabela(filtrados); 
    }
});

buscaNomeInput.addEventListener("keyup", (e) => { // Enter para buscar 
    if (e.key === "Enter") {
        btnBuscar.click();
    }
});

// ==========================================================================
// AÇÕES AUXILIARES
// ==========================================================================
btnNovo.addEventListener("click", () => { // Limpa o formulário para um novo contato
    limparFormulario();
    nomeInput.focus();
});

btnCancelar.addEventListener("click", () => { // Limpa o formulário e volta para o estado de "Novo Contato"
    limparFormulario();
});

function limparFormulario() { // Chama a função de limpeza
    formTitulo.textContent = "Novo Contato";
    formContato.reset();
    contatoIdInput.value = "";
}