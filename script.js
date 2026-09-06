
// Usuario base, disponible siempre para poder probar el inicio de sesión
const USUARIO_BASE = {
    nombre: "magaq",
    contraseña: "pruebasdefullstack2",
    correo: "magaqfullstack@gmail.com",
    esMenorDeEdad: false
};

// Referencias a elementos del DOM
const inputNombre = document.getElementById("nombre");
const inputContraseña = document.getElementById("contraseña");
const checkMostrar = document.getElementById("mostrar-contraseña");
const checkRecordarme = document.getElementById("recordarme");
const btnIngresar = document.getElementById("btn-ingresar");
const mensaje = document.getElementById("datos-registrados");

const formLogin = document.getElementById("form-login");
const panelBienvenida = document.getElementById("panel-bienvenida");
const bienvenidaUsuario = document.getElementById("bienvenida-usuario");
const bienvenidaCorreo = document.getElementById("bienvenida-correo");
const btnSalir = document.getElementById("btn-salir");

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

// Busca un usuario cuyo nombre y contraseña coincidan con lo ingresado.
// El nombre se compara sin distinguir mayúsculas de minúsculas, ya que
// los nombres se guardan capitalizados (ver registro.js), pero el
// usuario puede escribirlos de cualquier forma al iniciar sesión.
function validarCredenciales(nombre, contraseña) {
    const usuarios = obtenerUsuarios();
    return usuarios.find(
        (usuario) =>
            usuario.nombre.toLowerCase() === nombre.toLowerCase() &&
            usuario.contraseña === contraseña
    );
}

// Muestra u oculta la contraseña en texto plano
checkMostrar.addEventListener("change", () => {
    inputContraseña.type = checkMostrar.checked ? "text" : "password";
});

// Al cargar la página, se revisa si ya existe una sesión guardada.
// Se busca primero en localStorage (sesión que se mantiene aunque se
// cierre el navegador) y, si no está ahí, en sessionStorage (sesión
// que dura solo mientras la pestaña/navegador permanezca abierto).
window.addEventListener("DOMContentLoaded", () => {
    obtenerUsuarios(); // Garantiza que el usuario base siempre exista

    const nombreGuardado = localStorage.getItem("sesion_nombre_recordado");
    if (nombreGuardado) {
        inputNombre.value = nombreGuardado;
        checkRecordarme.checked = true;
    }

    const sesionPersistente = localStorage.getItem("sesion_activa");
    const sesionTemporal = sessionStorage.getItem("sesion_activa");
    const sesionGuardada = sesionPersistente || sesionTemporal;

    if (sesionGuardada) {
        const datosSesion = JSON.parse(sesionGuardada);
        mostrarBienvenida(datosSesion.nombre, datosSesion.correo);
    }
});

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.classList.remove("mensaje-ok", "mensaje-error");
    mensaje.classList.add(tipo === "ok" ? "mensaje-ok" : "mensaje-error");
}

function mostrarBienvenida(nombre, correo) {
    bienvenidaUsuario.textContent = nombre;
    bienvenidaCorreo.textContent = correo;
    formLogin.classList.add("oculto");
    panelBienvenida.classList.remove("oculto");
}

function cerrarSesion() {
    // Se elimina la sesión de ambos almacenamientos, sin importar
    // en cuál haya quedado guardada
    localStorage.removeItem("sesion_activa");
    sessionStorage.removeItem("sesion_activa");

    panelBienvenida.classList.add("oculto");
    formLogin.classList.remove("oculto");
    inputContraseña.value = "";
    mensaje.textContent = "";
}

// Evento principal: al presionar "Ingresar Datos"
btnIngresar.addEventListener("click", () => {
    const nombre = inputNombre.value.trim();
    const contraseña = inputContraseña.value;

    if (!nombre || !contraseña) {
        mostrarMensaje("Por favor complete ambos campos.", "error");
        return;
    }

    const usuarioValido = validarCredenciales(nombre, contraseña);

    if (usuarioValido && usuarioValido.esMenorDeEdad) {
        alert("Usuarios Menores de edad no pueden usar los servicios de esta página.");
        return;
    }

    if (usuarioValido) {
        mostrarMensaje("Inicio de sesión exitoso.", "ok");

        const datosSesion = JSON.stringify({
            nombre: usuarioValido.nombre,
            correo: usuarioValido.correo
        });

        // La sesión solo se mantiene tras cerrar el navegador si se
        // marca "Recordar inicio de sesión" (localStorage). En caso
        // contrario, se guarda en sessionStorage, que se borra al
        // cerrar el navegador o la pestaña.
        if (checkRecordarme.checked) {
            localStorage.setItem("sesion_activa", datosSesion);
            localStorage.setItem("sesion_nombre_recordado", nombre);
            sessionStorage.removeItem("sesion_activa");
        } else {
            sessionStorage.setItem("sesion_activa", datosSesion);
            localStorage.removeItem("sesion_activa");
            localStorage.removeItem("sesion_nombre_recordado");
        }

        setTimeout(() => {
            mostrarBienvenida(usuarioValido.nombre, usuarioValido.correo);
        }, 600);
    } else {
        mostrarMensaje("Usuario o contraseña incorrectos.", "error");
    }
});

// Permite iniciar sesión presionando "Enter"
inputContraseña.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        btnIngresar.click();
    }
});

btnSalir.addEventListener("click", cerrarSesion);
