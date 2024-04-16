function analizador() {
    const codigo = document.getElementById('codigo').value;
    const tabla = document.getElementById('table');
    limpiarTabla(tabla);

    const allrows = codigo.split('\n');
    let dentroFuncion = false;
    let dentroBucle = false;
    let dentroCondicion = false;
    let dentroPrintf = false;

    allrows.forEach((row, index) => {
        analizarLinea(row.trim(), tabla, index + 1, dentroFuncion, dentroBucle, dentroCondicion, dentroPrintf);
        dentroFuncion = row.includes("{") && !row.includes("}") ? true : false;
        dentroBucle = row.includes("for") || row.includes("while") || row.includes("do") ? true : false;
        dentroCondicion = row.includes("if") || row.includes("else") || row.includes("switch") ? true : false;
        dentroPrintf = row.includes("printf") ? true : false;
    });

    actualizarTablaConteo();
}

function limpiarTabla(tabla) {
    tabla.innerHTML = '<thead><tr><th>Componente Léxico</th><th>Lexema</th></tr></thead>';
}

function analizarLinea(row, tabla) {
    const estructurasSelectivas = ['if', 'else', 'switch'];
    const estructurasControl = ['for', 'do', 'while'];

    const operadoresAritmeticos = ['+', '-', '*', '/', '%'];
    const operadoresAsignacion = ['=', '+=', '-=', '*=', '/=', '%='];
    const operadoresComparacion = ['==', '!=', '<', '>', '<=', '>='];
    const operadoresLogicos = ['&&', '||', '!'];
    const operadoresIncrementoDecremento = ['++', '--'];
    const operadoresBitBit = ['&', '|', '^', '~', '<<', '>>'];
    const operadoresTernarios = ['?'];
    const operadoresPunteroDireccion = ['*', '&'];
    const delimitadores = ['(', ')', '[', ']', '{', '}', ',', ';'];
    const identificadorRegex = /^[a-zA-Z_]\w*$/;
    const numeroRegex = /^[0-9]+(?:\.[0-9]+)?$/; // Expresión regular para identificar números

    const palabrasFunciones = ['bool', 'int', 'float', 'double', 'void'];
    const inicioFuncionRegex = new RegExp(`\\b(?:${[...estructurasSelectivas, ...estructurasControl, ...palabrasFunciones].join('|')})\\s+([a-zA-Z_]\\w*)\\s*\\(`);

    // Verificar si la línea comienza con #include
    if (row.trim().startsWith('#include')) {
        const libreria = row.trim().match(/<([^>]*)>/);
        if (libreria && libreria.length > 1) {
            agregarFila(tabla, "Libreria", libreria[1]);
        }
        return; // Evitar que se realice más análisis en esta línea
    }

    const partes = row.split(/("[^"]*"|\b|\W)/).filter(part => part.trim() !== "");
    let context = null;

    partes.forEach((part, index) => {
        if (part.startsWith('"') && part.endsWith('"')) {
            agregarFila(tabla, "Cadena", part);
        } else if (context === '#include') {
            if (part === '<' || part === '>') {
                agregarFila(tabla, "Directiva de Preprocesador", context + part);
                context = null;
            } else {
                agregarFila(tabla, "Libreria", context + part); // Identificar librerías
            }
        } else if (part === '#include') {
            context = '#include';
        } else if (estructurasSelectivas.includes(part)) {
            agregarFila(tabla, "Estructura Selectiva", part);
        } else if (estructurasControl.includes(part)) {
            agregarFila(tabla, "Estructura de Control", part);
        } else if (palabrasFunciones.includes(part)) {
            if (part === 'main' && index > 0 && partes[index - 1] === 'int') {
                agregarFila(tabla, "Funcion", "main"); // Identificar funciones como main
            } else if (inicioFuncionRegex.test(row)) {
                const matches = row.match(inicioFuncionRegex);
                if (matches && matches.length > 1) {
                    agregarFila(tabla, "Funcion", matches[1]);
                    return; // Evitar que se clasifique como identificador
                }
            } else {
                agregarFila(tabla, "Palabra Reservada", part);
            }
        } else if (operadoresAritmeticos.includes(part)) {
            agregarFila(tabla, "Operador Aritmético", part);
        } else if (operadoresAsignacion.includes(part)) {
            agregarFila(tabla, "Operador de Asignación", part);
        } else if (operadoresComparacion.includes(part)) {
            agregarFila(tabla, "Operador de Comparación", part);
        } else if (operadoresLogicos.includes(part)) {
            agregarFila(tabla, "Operador Lógico", part);
        } else if (operadoresIncrementoDecremento.includes(part)) {
            agregarFila(tabla, "Operador Incremento/Decremento", part);
        } else if (operadoresBitBit.includes(part)) {
            agregarFila(tabla, "Operador Bit a Bit", part);
        } else if (operadoresTernarios.includes(part)) {
            agregarFila(tabla, "Operador Ternario", part);
        } else if (operadoresPunteroDireccion.includes(part)) {
            agregarFila(tabla, "Operador de Puntero/Dirección", part);
        } else if (part === 'printf') { 
            agregarFila(tabla, "Palabra Reservada", part);
        } else if (part === 'return') { 
            agregarFila(tabla, "Palabra Reservada", part);
        } else if (part.match(identificadorRegex)) {
            // Verificar si la palabra ya ha sido clasificada como una función
            const filas = tabla.querySelectorAll('tr');
            const funciones = Array.from(filas).filter(fila => fila.cells[0].innerText === "Funcion").map(fila => fila.cells[1].innerText);
            if (!funciones.includes(part)) {
                agregarFila(tabla, "Identificador", part);
            }
        } else if (numeroRegex.test(part)) {
            agregarFila(tabla, "Valor asignado", part);
        } else if (delimitadores.includes(part)) {
            agregarFila(tabla, "Delimitador", part);
        }
    });
}

let conteoComponentesLexicos = {}; // Objeto para almacenar el conteo de cada componente léxico

function agregarFila(tabla, comp, lexema) {
    tabla.insertRow(-1).innerHTML = `<tr><td>${comp}</td><td>${lexema}</td></tr>`;
    
    // Actualizar el conteo de componentes léxicos
    conteoComponentesLexicos[comp] = (conteoComponentesLexicos[comp] || 0) + 1;
    
    // Mostrar el conteo actualizado en la consola
    console.log(`Conteo de ${comp}: ${conteoComponentesLexicos[comp]}`);
    
    // Actualizar tabla de conteo
    actualizarTablaConteo();
}

function actualizarTablaConteo() {
    const tablaConteo = document.getElementById('tabla-conteo');
    const cuerpoTabla = tablaConteo.querySelector('tbody'); // Seleccionamos el cuerpo de la tabla
    
    cuerpoTabla.innerHTML = ''; // Limpiar contenido del cuerpo de la tabla

    // Llenar tabla de conteo
    for (const categoria in conteoComponentesLexicos) {
        if (conteoComponentesLexicos.hasOwnProperty(categoria)) {
            const cantidad = conteoComponentesLexicos[categoria];
            const fila = `<tr><td>${categoria}</td><td>${cantidad}</td></tr>`;
            cuerpoTabla.insertAdjacentHTML('beforeend', fila); // Insertar fila en el cuerpo de la tabla
        }
    }
}

