const animacion = (elemento) => {
  const numeroLetras = elemento.dataset.texto.length;
  //Animacion para el cursor
  for (let i = 0; i < numeroLetras; i++) {
    setTimeout(() => {
      const letra = document.createElement("span");
      letra.append(elemento.dataset.texto[i]);
      elemento.append(letra);
    }, 300 * i);
  }
};
export default animacion;
