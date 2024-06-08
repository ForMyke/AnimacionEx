const fs = require("fs");

class AnalizadorLexico {
  constructor(archivo) {
    this.archivo = archivo;
    this.tokens = [];
    this.erroresLexicos = [];
    this.palabrasReservadas = [
      "abstract",
      "assert",
      "boolean",
      "break",
      "byte",
      "case",
      "catch",
      "char",
      "class",
      "const",
      "continue",
      "default",
      "do",
      "double",
      "else",
      "enum",
      "extends",
      "final",
      "finally",
      "float",
      "for",
      "goto",
      "if",
      "implements",
      "import",
      "instanceof",
      "int",
      "interface",
      "long",
      "native",
      "new",
      "package",
      "private",
      "protected",
      "public",
      "return",
      "short",
      "static",
      "strictfp",
      "super",
      "switch",
      "synchronized",
      "this",
      "throw",
      "throws",
      "transient",
      "try",
      "void",
      "volatile",
      "while",
    ];
  }

  analizador() {
    const separadores = [";", ",", "(", ")", "{", "}", "[", "]", '"'];
    if (fs.existsSync(this.archivo)) {
      const data = fs.readFileSync(this.archivo, "utf8");
      const lines = data.split("\n");
      let numeroLinea = 0;
      for (let line of lines) {
        for (let separador of separadores) {
          line = line.replace(new RegExp(`\\${separador}`, "g"), " ");
        }
        line = line.trim();
        numeroLinea += 1;
        if (line.length === 0) {
          continue; // Ignora líneas vacías
        }
        console.log(line);
        if (line.startsWith("/")) {
          if (!this.automataCom(line)) {
            this.erroresLexicos.push(
              `Error en línea ${numeroLinea}. Comentario mal formado.`
            );
          }
        } else {
          this.tokens = line.split(/\s+/);
          for (let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i];
            if (this.palabrasReservadas.includes(token)) {
              if (i < this.tokens.length - 1) {
                const nextToken = this.tokens[i + 1];
                if (
                  [
                    "=",
                    "+",
                    "-",
                    "*",
                    "/",
                    ">",
                    "<",
                    "==",
                    "!=",
                    ">=",
                    "<=",
                  ].includes(nextToken)
                ) {
                  this.erroresLexicos.push(
                    `Error en línea ${numeroLinea}: uso incorrecto de palabra reservada '${token}'.`
                  );
                }
              }
            } else {
              if (!this.automata(token)) {
                this.erroresLexicos.push(
                  `Error en línea ${numeroLinea}: token inválido '${token}'.`
                );
              }
            }
          }
        }
      }
      if (this.erroresLexicos.length > 0) {
        for (let error of this.erroresLexicos) {
          console.log(error);
        }
      } else {
        console.log(
          `No hay errores de análisis léxico en el archivo ${this.archivo}`
        );
      }
    } else {
      console.log(
        `El archivo '${this.archivo}' no existe. Verifica la ruta y el nombre del archivo.`
      );
    }
  }

  automata(token) {
    const estadosAceptados = new Set([
      "C0",
      "C1",
      "C2",
      "C3",
      "C4",
      "C5",
      "C8",
      "C8_1",
      "C9",
      "C9_1",
    ]);
    let estado = "q0";
    let i = 0;
    while (i < token.length) {
      const char = token[i];
      switch (estado) {
        case "q0":
          if (char === "+" || char === "-") estado = "C9";
          else if (/[1-9]/.test(char)) estado = "C0";
          else if (char === "0") estado = "q3";
          else if (/[a-zA-Z_$]/.test(char)) estado = "C5";
          else if (["<", ">", "=", "!"].includes(char)) estado = "C8";
          else if (["*", "%", "/"].includes(char)) estado = "C9_1";
          else return false;
          break;
        case "C9":
          if (char === "0") estado = "q3";
          else if (/[1-9]/.test(char)) estado = "C0";
          else if (["+", "-"].includes(char)) estado = "C8";
          else if (char === " ") estado = "C9";
          else return false;
          break;
        case "q2":
          if (/[0-9]/.test(char)) estado = "C3";
          else if (/[a-zA-Z_$]/.test(char)) estado = "C5";
          else return false;
          break;
        case "q3":
          if (/[0-7]/.test(char)) estado = "C2";
          else if (char === "x" || char === "X") estado = "q4";
          else if (char === ".") estado = "q2";
          else return false;
          break;
        case "q4":
          if (/[0-9A-Fa-f]/.test(char)) estado = "C1";
          else return false;
          break;
        case "q5":
          if (/[0-9]/.test(char)) estado = "q7";
          else return false;
          break;
        case "q6":
          if (["+", "-"].includes(char)) estado = "q5";
          else if (/[0-9]/.test(char)) estado = "q7";
          else return false;
          break;
        case "q7":
          if (/[0-9]/.test(char)) estado = "C4";
          else return false;
          break;
        case "C0":
          if (char === ".") estado = "q2";
          else if (/[0-9]/.test(char)) estado = "C0";
          else return false;
          break;
        case "C1":
          if (/[0-9A-Fa-f]/.test(char)) estado = "C1";
          else return false;
          break;
        case "C2":
          if (/[0-7]/.test(char)) estado = "C2";
          else return false;
          break;
        case "C3":
          if (char === "E") estado = "q6";
          else if (/[0-9]/.test(char)) estado = "C3";
          else return false;
          break;
        case "C4":
          return true;
        case "C5":
          if (/[a-zA-Z0-9_$]/.test(char)) estado = "C5";
          else if (char === ".") estado = "q2";
          else return false;
          break;
        case "C8":
          if (char === "=") estado = "C8_1";
          else return false;
          break;
        default:
          return false;
      }
      i++;
    }
    return estadosAceptados.has(estado);
  }

  automataCom(line) {
    let estado = "q0";
    let i = 0;
    while (i < line.length) {
      const char = line[i];
      switch (estado) {
        case "q0":
          if (char === "/") estado = "q8";
          else return false;
          break;
        case "q8":
          if (char === "/") estado = "C6";
          else if (char === "*") estado = "q9";
          else return false;
          break;
        case "q9":
          if (char === "*") estado = "q10";
          else estado = "q9";
          break;
        case "q10":
          if (char === "*") estado = "q10";
          else if (char === "/") estado = "C6";
          else estado = "q9";
          break;
        default:
          return false;
      }
      i++;
    }
    return estado === "C6";
  }
}

function main() {
  const archivo = "EjemploPracticaAnalizador.java";
  const analizador = new AnalizadorLexico(archivo);
  analizador.analizador();
}

main();
