
// Usuario base, para que siempre exista aunque nadie se haya
// registrado todavía (misma referencia que en script.js)
const USUARIO_BASE = {
    nombre: "magaq",
    contraseña: "pruebasdefullstack2",
    correo: "magaqfullstack@gmail.com",
    esMenorDeEdad: false
};

// Referencias a elementos del DOM
const inputRegNombre = document.getElementById("reg-nombre");
const inputRegCorreo = document.getElementById("reg-correo");
const inputRegContraseña = document.getElementById("reg-contraseña");
const inputRegConfirmar = document.getElementById("reg-confirmar");
const inputRegFechaNacimiento = document.getElementById("reg-fecha-nacimiento");
const checkRegMostrar = document.getElementById("reg-mostrar-contraseña");
const btnRegistrar = document.getElementById("btn-registrar");
const registroMensaje = document.getElementById("registro-mensaje");

// Obtiene la lista de usuarios registrados desde localStorage.
// Si todavía no existe, la crea con el usuario base incluido.
function obtenerUsuarios() {
    const usuariosGuardados = localStorage.getItem("usuarios");
    if (usuariosGuardados) {
        return JSON.parse(usuariosGuardados);
    }
    const listaInicial = [USUARIO_BASE];
    localStorage.setItem("usuarios", JSON.stringify(listaInicial));
    return listaInicial;
}

function guardarUsuarios(listaUsuarios) {
    localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));
}

function mostrarMensajeRegistro(texto, tipo) {
    registroMensaje.textContent = texto;
    registroMensaje.classList.remove("mensaje-ok", "mensaje-error");
    registroMensaje.classList.add(tipo === "ok" ? "mensaje-ok" : "mensaje-error");
}

// Convierte el nombre a un formato prolijo: sin espacios de sobra
// y con la primera letra de cada palabra en mayúscula.
// Ejemplos: "  magaq  " -> "Magaq" | "ANA maria" -> "Ana Maria"
function capitalizarNombre(nombre) {
    const nombreLimpio = nombre.trim().replace(/\s+/g, " ");
    return nombreLimpio
        .split(" ")
        .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
        .join(" ");
}

// Calcula la edad actual a partir de una fecha de nacimiento
// en formato "YYYY-MM-DD" (el que entrega un input type="date")
function calcularEdad(fechaNacimientoTexto) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimientoTexto);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const todaviaNoCumpleEsteAño =
        hoy.getMonth() < nacimiento.getMonth() ||
        (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());

    if (todaviaNoCumpleEsteAño) {
        edad--;
    }

    return edad;
}

// Se garantiza que el usuario base exista desde que se carga la página
window.addEventListener("DOMContentLoaded", () => {
    obtenerUsuarios();
});

// Un solo checkbox controla la visibilidad de los dos campos de
// contraseña al mismo tiempo, ya que ambos deberían verse o
// esconderse juntos.
checkRegMostrar.addEventListener("change", () => {
    const tipo = checkRegMostrar.checked ? "text" : "password";
    inputRegContraseña.type = tipo;
    inputRegConfirmar.type = tipo;
});

btnRegistrar.addEventListener("click", () => {
    const nombreOriginal = inputRegNombre.value;
    const correo = inputRegCorreo.value.trim();
    const contraseña = inputRegContraseña.value;
    const confirmar = inputRegConfirmar.value;
    const fechaNacimiento = inputRegFechaNacimiento.value;

    // Validación del nombre: vacío o compuesto solo por espacios
    if (nombreOriginal.trim() === "") {
        mostrarMensajeRegistro("El nombre no puede estar vacío.", "error");
        return;
    }

    // Validación de la contraseña: vacía, solo espacios, o distinta de 8 caracteres
    if (contraseña.trim() === "" || contraseña.length !== 8) {
        mostrarMensajeRegistro("Contraseña incorrecta", "error");
        return;
    }

    if (contraseña !== confirmar) {
        mostrarMensajeRegistro("Las contraseñas no coinciden.", "error");
        return;
    }

    // Validación del correo: debe terminar en "@gmail.com"
    if (!correo.toLowerCase().endsWith("@gmail.com")) {
        alert("Correo electrónico invalido");
        return;
    }

    // Validación de la fecha de nacimiento: campo obligatorio
    if (fechaNacimiento === "") {
        mostrarMensajeRegistro("Debe ingresar una fecha de nacimiento.", "error");
        return;
    }

    const nombre = capitalizarNombre(nombreOriginal);

    const usuarios = obtenerUsuarios();
    const nombreOcupado = usuarios.some(
        (usuario) => usuario.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (nombreOcupado) {
        mostrarMensajeRegistro("Ese nombre de usuario ya está en uso.", "error");
        return;
    }

    const edad = calcularEdad(fechaNacimiento);
    const esMenorDeEdad = edad < 18;
    const correo_sinEspacio = correo.trim()
    const nuevoUsuario = { nombre, correo_sinEspacio, contraseña, esMenorDeEdad };
    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    if (esMenorDeEdad) {
        // La cuenta queda guardada, pero no podrá iniciar sesión
        alert("Usuarios Menores de edad no pueden usar los servicios de esta página.");
        return;
    }

    mostrarMensajeRegistro("Cuenta creada correctamente. Redirigiendo al inicio de sesión...", "ok");

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1200);
});

// Permite crear la cuenta presionando "Enter" en el último campo
inputRegConfirmar.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        btnRegistrar.click();
    }
});