let listaItens = JSON.parse(localStorage.getItem("listaCompras")) || [];

let filtroAtual = "todos";

const entradaItem = document.getElementById("entradaItem");
const entradaQuantidade = document.getElementById("entradaQuantidade");
const listaComprasUL = document.getElementById("listaCompras");
const botoesFiltro = document.querySelectorAll(".filtros .btn");

new Sortable(listaComprasUL, {
  animation: 150,
  onEnd: function (evt) {
    const [removed] = listaItens.splice(evt.oldIndex, 1);
    listaItens.splice(evt.newIndex, 0, removed);
    salvarItens();
  },
});

function adicionarItem() {
  const nomeItem = entradaItem.value.trim();
  const quantidadeItem = parseInt(entradaQuantidade.value, 10);

  if (nomeItem && quantidadeItem > 0) {
    const novoItem = {
      id: Date.now(),
      nome: nomeItem,
      quantidade: quantidadeItem,
      comprado: false,
    };
    listaItens.push(novoItem);
    salvarItens();
    atualizarLista();
    entradaItem.value = "";
    entradaQuantidade.value = "1";
    entradaItem.focus();
  } else {
    alert("Por favor, digite um item e uma quantidade válida.");
  }
}

function atualizarLista() {
  listaComprasUL.innerHTML = "";

  botoesFiltro.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.innerText.toLowerCase().includes(filtroAtual)) {
      btn.classList.add("active");
    }
  });

  const itensFiltrados = listaItens.filter((item) => {
    if (filtroAtual === "pendentes") {
      return !item.comprado;
    } else if (filtroAtual === "comprados") {
      return item.comprado;
    }
    return true;
  });

  if (itensFiltrados.length === 0) {
    const msg = document.createElement("li");
    msg.className = "list-group-item text-center text-muted";
    msg.textContent = "Nenhum item para exibir neste filtro.";
    listaComprasUL.appendChild(msg);
    return;
  }

  itensFiltrados.forEach((item) => {
    const li = document.createElement("li");
    li.className = `list-group-item d-flex justify-content-between align-items-center fade-in ${
      item.comprado ? "comprado" : ""
    }`;
    li.dataset.id = item.id;

    const itemTextSpan = document.createElement("span");
    itemTextSpan.className = "flex-grow-1 me-2";
    itemTextSpan.innerHTML = `${item.quantidade}x ${item.nome}`;
    itemTextSpan.ondblclick = () => habilitarEdicao(li, item);

    li.appendChild(itemTextSpan);

    const botoesDiv = document.createElement("div");

    const btnComprado = document.createElement("button");
    btnComprado.className = `btn btn-sm me-2 ${
      item.comprado ? "btn-warning" : "btn-outline-success"
    }`;
    btnComprado.innerHTML = item.comprado ? "Desfazer" : "✔️";
    btnComprado.onclick = () => toggleComprado(item.id);
    botoesDiv.appendChild(btnComprado);

    // Botão de remover
    const btnRemover = document.createElement("button");
    btnRemover.className = "btn btn-danger btn-sm";
    btnRemover.innerHTML = "&times;";
    btnRemover.onclick = () => removerItem(item.id, li);
    botoesDiv.appendChild(btnRemover);

    li.appendChild(botoesDiv);
    listaComprasUL.appendChild(li);
  });
}

function habilitarEdicao(liElement, item) {
  const itemTextSpan = liElement.querySelector("span.flex-grow-1");
  const originalText = itemTextSpan.innerHTML;

  const inputEdicaoNome = document.createElement("input");
  inputEdicaoNome.type = "text";
  inputEdicaoNome.className = "form-control editando me-2";
  inputEdicaoNome.value = item.nome;
  inputEdicaoNome.style.flexGrow = "1";

  const inputEdicaoQuantidade = document.createElement("input");
  inputEdicaoQuantidade.type = "number";
  inputEdicaoQuantidade.className = "form-control editando";
  inputEdicaoQuantidade.value = item.quantidade;
  inputEdicaoQuantidade.min = "1";
  inputEdicaoQuantidade.style.maxWidth = "60px";

  const wrapper = document.createElement("div");
  wrapper.className = "d-flex align-items-center flex-grow-1 me-2";
  wrapper.appendChild(inputEdicaoQuantidade);
  wrapper.appendChild(inputEdicaoNome);

  itemTextSpan.replaceWith(wrapper);
  inputEdicaoNome.focus();

  const finalizarEdicao = () => {
    item.nome = inputEdicaoNome.value.trim();
    item.quantidade = parseInt(inputEdicaoQuantidade.value, 10);
    if (item.nome === "" || item.quantidade <= 0) {
      alert(
        "Nome do item e quantidade não podem ser vazios ou inválidos. Revertendo."
      );

      const [originalQty, ...originalNameParts] = originalText.split("x ");
      item.nome = originalNameParts.join("x ");
      item.quantidade = parseInt(originalQty, 10);
    }
    salvarItens();
    atualizarLista();
  };

  inputEdicaoNome.addEventListener("blur", finalizarEdicao);
  inputEdicaoNome.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      finalizarEdicao();
    }
  });
  inputEdicaoQuantidade.addEventListener("blur", finalizarEdicao);
  inputEdicaoQuantidade.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      finalizarEdicao();
    }
  });
}

function toggleComprado(id) {
  const itemIndex = listaItens.findIndex((item) => item.id === id);
  if (itemIndex !== -1) {
    listaItens[itemIndex].comprado = !listaItens[itemIndex].comprado;
    salvarItens();
    atualizarLista();
  }
}

function removerItem(id, liElement) {
  liElement.classList.add("fade-out");
  liElement.addEventListener("animationend", () => {
    listaItens = listaItens.filter((item) => item.id !== id);
    salvarItens();
    atualizarLista();
  });
}

function limparComprados() {
  const itensCompradosNaTela = document.querySelectorAll(
    ".list-group-item.comprado"
  );
  let count = 0;
  if (itensCompradosNaTela.length === 0) {
    alert("Nenhum item comprado para remover.");
    return;
  }

  itensCompradosNaTela.forEach((li) => {
    li.classList.add("fade-out");
    li.addEventListener("animationend", () => {
      count++;
      if (count === itensCompradosNaTela.length) {
        listaItens = listaItens.filter((item) => !item.comprado);
        salvarItens();
        atualizarLista();
      }
    });
  });
}

function salvarItens() {
  localStorage.setItem("listaCompras", JSON.stringify(listaItens));
}

entradaItem.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    adicionarItem();
  }
});
entradaQuantidade.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    adicionarItem();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  atualizarLista();
});
