window.addEventListener("DOMContentLoaded", (event) => {
  alert("UVM - Actividad 8, hecho por Fabrizio Caceres");

  // Función general para obtener datos de la hoja y graficar
  const generateChart = ({sheetID, sheetName, query, chartType, elementID, dateColumn, valueColumn, chartTitle, customFirstColumn = "none", additionalSeriesColumn = "none", groupby = "no"}) => {

    const sheetDataHandler = (sheetData) => {
      console.log("Datos recibidos: ", sheetData);

      // Cargar las librerías necesarias dependiendo del tipo de gráfico
      google.charts.load('current', {'packages': ['sankey', 'corechart', 'bar', 'calendar', 'Column', 'Area']});
      google.charts.setOnLoadCallback(() => drawChart(chartType, sheetData));

      // Mapea los datos para usar la columna personalizada, fecha o series
      const mappedData = sheetData.map(row => ({
        FirstColumn: customFirstColumn !== "none" ? row[customFirstColumn] : new Date(row[dateColumn]),  // Columna personalizada o fecha
        SeriesColumn: additionalSeriesColumn !== "none" ? row[additionalSeriesColumn] : null,  // Columna adicional para series
        Value: parseFloat(row[valueColumn])  // Columna de valor numérico
      }));

      // Agrupar valores si el argumento groupby es "yes"
      let groupedData = {};

      if (groupby === "yes") {
        mappedData.forEach(row => {
          const key = customFirstColumn !== "none" ? row.FirstColumn : row.FirstColumn.toDateString(); // Agrupar por la columna correspondiente
          if (!groupedData[key]) {
            groupedData[key] = {};
          }
          if (additionalSeriesColumn !== "none" && row.SeriesColumn) {
            if (!groupedData[key][row.SeriesColumn]) {
              groupedData[key][row.SeriesColumn] = 0;
            }
            groupedData[key][row.SeriesColumn] += row.Value;
          } else {
            if (!groupedData[key]['Default']) {
              groupedData[key]['Default'] = 0;
            }
            groupedData[key]['Default'] += row.Value;
          }
        });
        
        mappedData.length = 0; // Limpiar el arreglo original
        for (let key in groupedData) {
          if (additionalSeriesColumn !== "none") {
            for (let series in groupedData[key]) {
              mappedData.push({ FirstColumn: key, SeriesColumn: series, Value: groupedData[key][series] });
            }
          } else {
            mappedData.push({ FirstColumn: key, Value: groupedData[key]['Default'] });
          }
        }
      }

      // Verificamos si los datos mapeados son válidos
      if (mappedData.length > 0 && mappedData[0].FirstColumn && !isNaN(mappedData[0].Value)) {
        const dataTable = new google.visualization.DataTable();

        // Si customFirstColumn tiene valor, usamos una columna no de fecha
        if (customFirstColumn !== "none") {
          dataTable.addColumn({ type: 'string', id: 'FirstColumn' });  // Primera columna personalizada (no fecha)
        } else {
          dataTable.addColumn({ type: 'date', id: 'Date' });  // Columna de fecha
        }

        if (additionalSeriesColumn !== "none") {
          // Agregamos una columna por cada serie única en los datos
          const series = [...new Set(mappedData.map(row => row.SeriesColumn))]; // Obtener series únicas
          series.forEach(serie => {
            dataTable.addColumn({ type: 'number', label: serie });
          });
          
          // Poblar DataTable con datos mapeados
          const rows = {};
          mappedData.forEach(row => {
            if (!rows[row.FirstColumn]) {
              rows[row.FirstColumn] = [row.FirstColumn];
              series.forEach(() => rows[row.FirstColumn].push(null)); // Agregar espacios nulos para cada serie
            }
            const serieIndex = series.indexOf(row.SeriesColumn) + 1; // Índice de la serie en las columnas
            rows[row.FirstColumn][serieIndex] = row.Value;
          });

          // Agregar las filas al DataTable
          Object.values(rows).forEach(row => {
            dataTable.addRow(row);
          });
        } else {
          dataTable.addColumn({ type: 'number', id: 'Value' });

          // Poblar DataTable con datos mapeados
          mappedData.forEach(row => {
            if (row.FirstColumn && row.Value) {
              dataTable.addRow([row.FirstColumn, row.Value]);
            }
          });
        }

        drawChart(chartType, dataTable, elementID, chartTitle);
      } else {
        console.error("Los datos mapeados no contienen las columnas esperadas.");
      }
    };

    // Llamada para obtener datos de la hoja de Google Sheets
    getSheetData({
      sheetID,
      sheetName,
      query,
      callback: sheetDataHandler
    });
  };

  // Función para dibujar diferentes tipos de gráficos
  const drawChart = (chartType, dataTable, elementID, chartTitle) => {
    let chart;
    const options = {
      title: chartTitle || "Gráfico Generado",  // Usa el título proporcionado o uno predeterminado
      height: 350
    };

    switch (chartType) {
      case 'calendar':
        chart = new google.visualization.Calendar(document.getElementById(elementID));
        break;
      case 'bar':
        chart = new google.visualization.BarChart(document.getElementById(elementID));
        break;
      case 'line':
        chart = new google.visualization.LineChart(document.getElementById(elementID));
        break;
      case 'sankey':
        chart = new google.visualization.Sankey(document.getElementById(elementID));
        break;
      case 'corechart':
        chart = new google.visualization.PieChart(document.getElementById(elementID));
        break;
      case 'column':
        chart = new google.visualization.ColumnChart(document.getElementById(elementID));
        break;
      case 'area':
        chart = new google.visualization.AreaChart(document.getElementById(elementID));
        break;
      default:
        console.error("Tipo de gráfico no reconocido.");
        return;
    }

    chart.draw(dataTable, options);
  };

  generateChart({
    sheetID: "1TJ3uAqSc0Fr6wRWsW4aS7D5xNL4bDZSyw6MA0x0kiRg",
    sheetName: "Database",
    query: 'SELECT A, C WHERE A <> "General" AND B = 2018 AND D CONTAINS "Porcentaje en Pobreza Moderada"',
    chartType: "bar",
    elementID: 'p1Chart',  // ID del div donde se mostrará el gráfico
    customFirstColumn: 'Estado',
    valueColumn: 'Value',
    chartTitle: "Porcentaje %",
	additionalSeriesColumn: "none",
    groupby: "yes"
  });
  
  generateChart({
    sheetID: "1TJ3uAqSc0Fr6wRWsW4aS7D5xNL4bDZSyw6MA0x0kiRg",
    sheetName: "Database",
    query: 'SELECT A, C, D WHERE A <> "General" AND B = 2018 AND D CONTAINS "Poblacion en Pobreza Moderada"',
    chartType: "column",
    elementID: 'p2Chart',  // ID del div donde se mostrará el gráfico
    customFirstColumn: 'Estado',
    valueColumn: 'Value',
    chartTitle: "Número de Personas",
	additionalSeriesColumn: "none",
    groupby: "yes"
  });
  
  generateChart({
    sheetID: "1TJ3uAqSc0Fr6wRWsW4aS7D5xNL4bDZSyw6MA0x0kiRg",
    sheetName: "Database",
    query: 'SELECT D, C WHERE A <> "General" AND B = 2018 AND D CONTAINS "Poblacion en Pobreza"',
    chartType: "corechart",
    elementID: 'p3Chart',  // ID del div donde se mostrará el gráfico
    customFirstColumn: 'Situacion',
    valueColumn: 'Value',
    chartTitle: "Número de Personas",
	additionalSeriesColumn: "none",
    groupby: "yes"
  });
  
  generateChart({
    sheetID: "1TJ3uAqSc0Fr6wRWsW4aS7D5xNL4bDZSyw6MA0x0kiRg",
    sheetName: "Database",
    query: 'SELECT B, C, D WHERE A <> "General" AND D CONTAINS "Poblacion en Pobreza"',
    chartType: "line",
    elementID: 'p4Chart',  // ID del div donde se mostrará el gráfico
    customFirstColumn: 'Attribute',
    valueColumn: 'Value',
    chartTitle: "Num de Personas",
	additionalSeriesColumn: "Situacion",
    groupby: "yes"
  });
  
  generateChart({
    sheetID: "1TJ3uAqSc0Fr6wRWsW4aS7D5xNL4bDZSyw6MA0x0kiRg",
    sheetName: "Database",
    query: 'SELECT B, C, D WHERE A = "General" AND D = "Numero de Población con al menos una carencia social" OR D = "Numero de Población en situación de pobreza"',
    chartType: "area",
    elementID: 'p5Chart',  // ID del div donde se mostrará el gráfico
    customFirstColumn: 'Attribute',
    valueColumn: 'Value',
    chartTitle: "Num de Personas",
	additionalSeriesColumn: "Situacion",
    groupby: "yes"
  });

});

