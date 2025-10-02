// ==========================
// Estado y almacenamiento
// ==========================
let modelos = JSON.parse(localStorage.getItem("modelos")) || [];
let tareas  = JSON.parse(localStorage.getItem("tareas"))  || [];
let editIndex = null;

function guardarModelos() { localStorage.setItem("modelos", JSON.stringify(modelos)); }
function guardarTareas()  { localStorage.setItem("tareas",  JSON.stringify(tareas));  }

// ==========================
// Tabla de modelos
// ==========================
function renderTabla() {
  const tbody = document.getElementById("modelTableBody");
  tbody.innerHTML = "";

  modelos.forEach((modelo, index) => {
    const fila = document.createElement("tr");

    // Foto + Nombre
    const celdaFoto = document.createElement("td");
    const img = document.createElement("img");
    img.src = modelo.foto || "";
    img.classList.add("modelo-foto");

    const nombre = document.createElement("div");
    nombre.classList.add("modelo-nombre");
    nombre.textContent = modelo.nombre || "";

    celdaFoto.appendChild(img);
    celdaFoto.appendChild(nombre);

    // Estudio
    const celdaEstudio = document.createElement("td");
    celdaEstudio.textContent = modelo.estudio || "";

    // Contenido
    const celdaContenido = document.createElement("td");
    celdaContenido.appendChild(renderChips(modelo.contenido || [], index, "contenido"));

    // Tráfico
    const celdaTrafico = document.createElement("td");
    celdaTrafico.appendChild(renderChips(modelo.trafico || [], index, "trafico"));

    // Horario
    const celdaHorario = document.createElement("td");
    celdaHorario.textContent = modelo.horario || "";

    // Acciones
    const celdaAcciones = document.createElement("td");
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.classList.add("action-btn");
    btnEditar.onclick = () => editarModelo(index);

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.classList.add("action-btn");
    btnEliminar.onclick = () => {
      modelos.splice(index, 1);
      guardarModelos();
      renderTabla();
    };

    celdaAcciones.appendChild(btnEditar);
    celdaAcciones.appendChild(btnEliminar);

    fila.appendChild(celdaFoto);
    fila.appendChild(celdaEstudio);
    fila.appendChild(celdaContenido);
    fila.appendChild(celdaTrafico);
    fila.appendChild(celdaHorario);
    fila.appendChild(celdaAcciones);

    tbody.appendChild(fila);
  });
}

// ==========================
// Render chips bonitos
// ==========================
function renderChips(lista, indexModelo, tipo) {
  const cont = document.createElement("div");
  cont.classList.add("checkbox-container");

  lista.forEach((obj, idx) => {
    const id = `chip-${tipo}-${indexModelo}-${idx}`;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.value = obj.nombre;
    input.classList.add("checkbox-input");
    input.checked = obj.activo;

    const label = document.createElement("label");
    label.htmlFor = id;
    label.classList.add("checkbox-label");
    label.textContent = obj.nombre;

    // Toggle guardado en vivo
    input.addEventListener("change", () => {
      modelos[indexModelo][tipo][idx].activo = input.checked;
      guardarModelos();
    });

    cont.appendChild(input);
    cont.appendChild(label);
  });

  return cont;
}

// ==========================
// Modal Modelo
// ==========================
function abrirModalModelo(modelo = null, index = null) {
  const modal = document.getElementById("modalModelo");
  modal.style.display = "flex";

  document.getElementById("modalModeloTitulo").textContent = modelo ? "Editar modelo" : "Agregar modelo";

  // Campos base
  document.getElementById("modeloNombre").value  = modelo?.nombre  || "";
  document.getElementById("modeloEstudio").value = modelo?.estudio || "";
  document.getElementById("modeloFoto").value    = "";

  // Horario
  document.querySelectorAll("#modeloHorario input").forEach(r => {
    r.checked = (modelo?.horario === r.value) || (!modelo?.horario && r.value === "Mañana");
  });

  // Renderizar páginas actuales del modelo
  renderModalCheckboxes("chipsContenido", modelo?.contenido || []);
  renderModalCheckboxes("chipsTrafico",   modelo?.trafico   || []);

  editIndex = index;
}

// Render checkboxes ocultos + etiquetas visibles en el modal
function renderModalCheckboxes(containerId, lista) {
  const cont = document.getElementById(containerId);
  cont.innerHTML = "";
  lista.forEach((obj, idx) => {
    const id = `${containerId}-${idx}-${Math.random()}`;
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.value = obj.nombre;
    input.classList.add("checkbox-input");
    input.checked = obj.activo;

    const label = document.createElement("label");
    label.htmlFor = id;
    label.classList.add("checkbox-label");
    label.textContent = obj.nombre;

    cont.appendChild(input);
    cont.appendChild(label);
  });
}

// Obtener seleccionados desde el modal
function getSelectedFromModal(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]`))
    .map(i => ({ nombre: i.value, activo: i.checked }));
}

document.getElementById("addModel").addEventListener("click", () => abrirModalModelo());
document.getElementById("btnCancelarModelo").addEventListener("click", () => {
  document.getElementById("modalModelo").style.display = "none";
  editIndex = null;
});

// Guardar modelo
document.getElementById("btnGuardarModelo").addEventListener("click", () => {
  const nombre  = document.getElementById("modeloNombre").value.trim();
  const estudio = document.getElementById("modeloEstudio").value.trim();
  const horario = document.querySelector("#modeloHorario input:checked")?.value || "Mañana";

  const contenidoSeleccionado = getSelectedFromModal("chipsContenido");
  const traficoSeleccionado   = getSelectedFromModal("chipsTrafico");

  const fotoInput = document.getElementById("modeloFoto");
  const archivo = fotoInput.files[0];

  const guardar = (fotoBase64) => {
    const data = {
      nombre: nombre.toUpperCase(),
      estudio,
      horario,
      contenido: contenidoSeleccionado,
      trafico:   traficoSeleccionado,
      foto: fotoBase64 || (editIndex !== null ? (modelos[editIndex].foto || "") : "")
    };

    if (editIndex !== null) {
      modelos[editIndex] = data;
      editIndex = null;
    } else {
      modelos.push(data);
    }

    guardarModelos();
    renderTabla();
    document.getElementById("modalModelo").style.display = "none";
    fotoInput.value = "";
  };

  if (archivo) {
    const reader = new FileReader();
    reader.onload = e => guardar(e.target.result);
    reader.readAsDataURL(archivo);
  } else {
    guardar();
  }
});

function editarModelo(index) {
  abrirModalModelo(modelos[index], index);
}

// ==========================
// Agregar páginas dentro del modal
// ==========================
document.getElementById("btnAddContenido").addEventListener("click", () => {
  const input = document.getElementById("inputContenido");
  const val = input.value.trim();
  if (!val) return;

  let actuales = getSelectedFromModal("chipsContenido");
  if (!actuales.find(p => p.nombre === val)) actuales.push({ nombre: val, activo: true });

  renderModalCheckboxes("chipsContenido", actuales);
  input.value = "";
});

document.getElementById("btnAddTrafico").addEventListener("click", () => {
  const input = document.getElementById("inputTrafico");
  const val = input.value.trim();
  if (!val) return;

  let actuales = getSelectedFromModal("chipsTrafico");
  if (!actuales.find(p => p.nombre === val)) actuales.push({ nombre: val, activo: true });

  renderModalCheckboxes("chipsTrafico", actuales);
  input.value = "";
});

// ==========================
// Tareas
// ==========================
function renderTareas() {
  const ul = document.getElementById("lista-tareas");
  if (!ul) return;
  ul.innerHTML = "";

  tareas.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t.texto;

    // 🔥 clic en la tarea para eliminar
    li.addEventListener("click", () => {
      li.classList.add("fade-out");
      setTimeout(() => {
        tareas.splice(i, 1);
        guardarTareas();
        renderTareas();
      }, 600);
    });

    ul.appendChild(li);
  });
}

const btnNuevaTarea = document.getElementById("btnNuevaTarea");
if (btnNuevaTarea) {
  btnNuevaTarea.addEventListener("click", () => {
    document.getElementById("modalTarea").style.display = "flex";
    const input = document.getElementById("inputTarea");
    input.value = "";
    input.focus();
  });

  document.getElementById("btnCancelarTarea").addEventListener("click", () => {
    document.getElementById("modalTarea").style.display = "none";
  });

  document.getElementById("btnGuardarTarea").addEventListener("click", () => {
    const txt = document.getElementById("inputTarea").value.trim();
    if (!txt) return;
    tareas.push({ texto: txt, fecha: Date.now() });
    guardarTareas();
    renderTareas();
    document.getElementById("modalTarea").style.display = "none";
  });

  document.getElementById("inputTarea").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("btnGuardarTarea").click();
    }
  });
}

// ==========================
// Novedades
// ==========================
const novedadesEl = document.getElementById("novedades-texto");
if (novedadesEl) {
  const saved = localStorage.getItem("novedades") || "";
  novedadesEl.value = saved;
  novedadesEl.addEventListener("input", () => {
    localStorage.setItem("novedades", novedadesEl.value);
  });
}

// ==========================
// Inicializar
// ==========================
renderTabla();
renderTareas();

// Referencias al modal de detalles
const modalDetalles = document.getElementById("modalDetalles");
const closeDetalles = document.querySelector(".close-detalles");

// Función para abrir el modal de detalles al hacer clic en la foto
document.addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("foto-modelo")) {
    modalDetalles.style.display = "block";
  }
});

// Cerrar modal con la X
closeDetalles.addEventListener("click", () => {
  modalDetalles.style.display = "none";
});

// Cerrar modal al hacer clic fuera
window.addEventListener("click", (e) => {
  if (e.target === modalDetalles) {
    modalDetalles.style.display = "none";
  }
});

 
