Primero debes de instalar node js y agregar el "package.json"

Comando - npm init -y

Despues debes de trabajar con rollup para ponerlo en modulos

Comando - npm install @rollup/plugin-json --save-dev


Te creare la carpeta de node_modules 

De ahi debes de crear un archivo con el nombre de "rollup.config.mjs" con el siguiente contenido 
// rollup.config.mjs
import json from '@rollup/plugin-json';

export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	},
	plugins: [json()]
};

Ahora en package.json agrega este comando 

"type": "module"