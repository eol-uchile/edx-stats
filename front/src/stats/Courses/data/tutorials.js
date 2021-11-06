const overviewTutorial = [
    {
        title: 'Resumen del curso',
        intro: 'Aquí podrá ver las estadisticas de su curso.',
    },
    {
        element: '#countboxes',
        title: 'Estadísticas generales',
        intro: `En esta sección se cargarán las estadísticas generales, 
        es decir, cuál es el registro de la totalidad del curso a la fecha.`,
    },
    {
        element: '#chartboxes',
        title: 'Estadísticas semanales',
        intro: `En esta sección se cargarán las estadísticas semanales, 
        gráficando las visitas diarias al curso junto a su duración 
        y cuál fue el contenido más visto de la semana indicada, agrupado
        por sección o subsección.`,
    },
    {
        element: '#chartboxes .btn-group',
        title: 'Estadísticas semanales',
        intro: `Si quiere ver las estadísticas de semanas anteriores, 
        puede hacerlo moviéndose con los botones o seleccionando
        la fecha del último día a buscar.`,
    },
    {
        element: '#analitica-menu',
        title: 'Estadísticas particulares',
        intro: `Si desea ver estadísticas más detalladas, asi como descargarlas
        en una planilla, puede hacerlo visitando los siguientes enlaces.`,
    },
];

const timesTutorial = [
    {
        title: 'Tiempo de visualización',
        intro: 'Aquí podrá ver donde los estudiantes pasaron más tiempo en su curso.',
    },
    {
        element: '.date-table-selectors',
        title: 'Tiempo de visualización',
        intro: `Si quiere ver las estadísticas de otro periodo de tiempo
      seleccione las fechas deseadas y luego cárguelas con el botón Explorar.`,
    },
    {
        intro: 'Algunas estadísticas pueden ser agrupadas por <b>unidad</b> o <b>sección</b>, otorgando un mayor o menor nivel de detalle. <img src="https://analytics.isa.andhael.cl/ee32e3f086b7acaa9a4c7b7be3d0d881.png" /> '
    },
    {
        intro: 'Asi también es posible descargar esta información en una planilla de cálculos. <img src="https://analytics.isa.andhael.cl/7c31dc49d3d5d42cb749b13800d44bd3.png" />'
    },
    {
        element: '#Tiempototal',
        title: 'Tiempo total',
        intro: `En esta sección se cargará el tiempo visto de cada unidad, 
      acompañado de la cantidad de estudiantes que
      visitaron el contenido.`,
    },
    {
        element: '#TiempoPromedio',
        title: 'Tiempo promedio',
        intro: `En esta sección se cargará el tiempo promedio visto de cada unidad, 
      acompañado de la desviación estándar asociada.`,
    },
    {
        element: '#DetallesPorEstudiante',
        title: 'Detalle por estudiante',
        intro: `En esta sección se cargará una tabla con el tiempo de cada estudiante 
      registrado en el curso.`,
    },
    {
        element: '#DetallesPorEstudiante nav',
        title: 'Detalle por estudiante',
        intro: `Para ver la información de cada estudiante, desplácese usando estos
      botones.`,
    },
];

const visitsTutorial = [
    {
        title: 'Visitas por contenido',
        intro:
            'Aquí podrá ver lo que los usuarios visitan con más regularidad en su curso.',
    },
    {
        element: '.date-table-selectors',
        title: 'Visitas por contenido',
        intro: `Si quiere ver las estadísticas agrupadas de otro periodo de tiempo
      seleccione las fechas deseadas y luego cárguelas con el botón Explorar.`,
    },
    {
        intro: 'Algunas estadísticas pueden ser agrupadas por <b>unidad</b> o <b>sección</b>, otorgando un mayor o menor nivel de detalle. <img src="https://analytics.isa.andhael.cl/ee32e3f086b7acaa9a4c7b7be3d0d881.png" /> '
    },
    {
        intro: 'Asi también es posible descargar esta información en una planilla de cálculos. <img src="https://analytics.isa.andhael.cl/7c31dc49d3d5d42cb749b13800d44bd3.png" />'
    },
    {
        element: '#VisitasTotales',
        title: 'Visitas totales',
        intro: `En esta sección se cargarán las visitas de cada sección, 
      acompañado de la cantidad de estudiantes que
      vieron el contenido.`,
    },
    {
        element: '#date-browser',
        title: 'Visitas diarias',
        intro: `En esta sección se cargará la cantidad de visitas diarias de cada sección.
      Puede seleccionar distintos periodos de visualización.`,
    },
    {
        element: '#DetallesPorEstudiante',
        title: 'Detalle por estudiante',
        intro: `En esta sección se cargará una tabla con las visitas de cada estudiante 
      registrado en el curso.`,
    },
    {
        element: '#DetallesPorEstudiante nav',
        title: 'Detalle por estudiante',
        intro: `Para ver la información de cada estudiante, desplácese usando estos
      botones.`,
    },
];

const videosTutorial = [
    {
        title: 'Actividad por videos',
        intro: 'Aquí podrá ver la actividad de los videos del curso.',
    },
    {
        intro: 'Algunas estadísticas pueden ser descargadas en una planilla de cálculos. <img src="https://analytics.isa.andhael.cl/7c31dc49d3d5d42cb749b13800d44bd3.png" />'
    },
    {
        element: '#VisualizacionesTotales',
        title: 'Visualizaciones totales',
        intro: `En esta sección se cargarán las visualizaciones de cada video, 
      incluyendo repeticiones, 
      acompañado de la cantidad de estudiantes que
      vieron el contenido.`,
    },
    {
        element: '#Cobertura',
        title: 'Cobertura',
        intro: `En esta sección se cargará la cantidad de estudiantes que han visto
      en completitud los videos y cuántos no lo han hecho.
      Las estadísticas en verde corresponden a visualizaciones completas.`,
    },
    {
        element: '#DetallesPorVideo',
        title: 'Detalle por video',
        intro: `En esta sección se cargará una linea de tiempo mostrando los segmentos reproducidos de un video.
      Las estadísticas en azul oscuro corresponden a repeticiones.`,
    },
    {
        element: '#DetallesPorVideo .input-group',
        title: 'Detalle por video',
        intro: `Para ver la información de otro video, seleccionelo en la lista
      desplegable.`,
    },
];

export {
    overviewTutorial,
    timesTutorial,
    visitsTutorial,
    videosTutorial
};