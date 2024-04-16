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

\begin{itemize}
\item Se utiliza el evento onload en el body para llamar a la función `analizador()` cuando se carga la página.
\item Se utiliza el evento onclick en el botón `Analizar` para llamar a la función `analizador()` cuando se hace clic en él.
\end{itemize}


