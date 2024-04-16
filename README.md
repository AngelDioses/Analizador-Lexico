# Analizador Léxico

## Descripción

Se ha desarrollado la implementación de un analizador léxico para identificar y clasificar los diferentes componentes léxicos que estén presentes en un frágmento de código en C. Se han identificado palabras reservadas, identificadores, funciones, librerías, operadores, delimitadores, entre otros.

## Cómo ejecutar el proyecto

1. Clonar el repositorio
2. Abrir el archivo `index.html` en su navegador de preferencia
3. Ingresar el código a analizar y presionar el botón `Analizar`

## Estructura del Analizador Léxico

1. `scanner.js`: Se realiza la implementación del analizador léxico
2. `index.html`: Visualización de resultados y realización de la interfaz gráfica
3. `styles.css`: Diseño de la interfaz gráfica

## Funciones principales

### Función `analizador()`

Esta función es la entrada principal del analizador. Obtiene el código fuente del elemento HTML con el id `codigo`, limpia la tabla de salida y luego itera sobre cada línea del código llamando a la función `analizarLinea()` para analizarla.

### Función `analizarLinea(row, tabla)`

Esta función analiza una línea del código fuente y clasifica los diferentes componentes léxicos presentes en ella. Utiliza expresiones regulares para identificar palabras clave, identificadores, operadores, etc.

### Eventos DOM

- Se utiliza el evento onload en el body para llamar a la función `analizador()` cuando se carga la página.
- Se utiliza el evento onclick en el botón `Analizar` para llamar a la función `analizador()` cuando se hace clic en él.

## Código

index.html
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analizador Léxico</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body onload="analizador()">
    <header>
        <h1>Analizador Léxico</h1>
    </header>
    <main>
        <div class="container">
            <div class="column">
                <textarea id="codigo" rows="10" cols="50" placeholder="Ingresa tu código aquí"></textarea>
                <button onclick="analizador()">Analizar</button>
            </div>
            <div class="column">
                <div class="table-wrapper">
                    <table id="table" class="fl-table">
                        <thead>
                            <tr>
                                <th>Componente léxico</th>
                            </tr>
                        </thead>
                        <tbody id="componente-lexico-body">
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="column">
                <div class="table-wrapper">
                    <table id="tabla-conteo" class="fl-table">
                        <thead>
                            <tr>
                                <th>Componente Léxico</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody id="lexema-body">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
    <footer>
        <p> Grupo 1</p>
    </footer>
    <script src="scanner.js" type="text/javascript"></script>
</body>
</html>
```
scanner.js
```js
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
            // Verificar si la palabra ya ha sido clasificada como una funcion
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
```

styles.css
```css
/* Reset de estilos */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #1e1e1e;
    color: #ffffff;
    padding: 20px;
}

header {
    text-align: center;
    margin-bottom: 20px;
}

h1 {
    font-size: 24px;
    margin-bottom: 10px;
}

main {
    display: flex;
    justify-content: center;
}

.container {
    display: flex;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
}

.column {
    flex: 1;
    margin-right: 20px;
}

textarea {
    width: 100%;
    min-height: 200px;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #444;
    border-radius: 5px;
    background-color: #333;
    color: #ffffff;
    resize: vertical;
}

button {
    width: 100%;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #007acc;
    color: #ffffff;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #005a8c;
}

.table-wrapper {
    margin-bottom: 20px;
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
}

th, td {
    padding: 10px;
    border: 1px solid #444;
}

th {
    background-color: #007acc;
    color: #ffffff;
    text-align: left;
}

tr:nth-child(even) {
    background-color: #333;
}

footer {
    text-align: center;
    margin-top: 20px;
    color: #888888;
}
```




