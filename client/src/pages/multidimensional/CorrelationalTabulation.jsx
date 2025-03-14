/*
  const [inputString, setInputString] = useState();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const [processedData, inputString_aux] = processNestedData(rawDataSet);
    setInputString(inputString_aux);
    setRawDataSet(processedData);
    console.log(processedData);
  };

  const processNestedData = (rawInput) => {
    // Eliminar espacios extra y separar por filas o bloques
    const rows = rawInput
      .trim()
      .split(/\n|\),|\) /)
      .map((row) => row.replace(/[()]/g, "").trim());

    // Procesar cada fila/bloque como una lista de números
    const processedData = rows.map((row) => {
      return row.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
    });

    // Convertir el resultado a una cadena formateada
    const formattedString = processedData
      .map((row) => `(${row.join(",")})`)
      .join(", ");

    return [processedData, formattedString];
  };


*/

import React from "react";

const Page = () => {
  return (
    <div>
      <h2>hola</h2>
    </div>
  );
};

export default Page;
