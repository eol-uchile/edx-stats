import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { useState, Fragment } from 'react';
import { useEffect } from 'react';

const placeHolder = {
  width: { baseVal: { value: 0 } },
  height: { baseVal: { value: 0 } },
};

const ExportChart = ({ backgroundColor, chartSelector, filename }) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  let svg = document.getElementsByClassName(chartSelector)[0]
    ? document.getElementsByClassName(chartSelector)[0].children[0]
    : placeHolder;

  useEffect(() => {
    console.log('I detect change', svg);
  });

  return (
    <Fragment>
      <Button>
        Descargar Gráfico
        <FontAwesomeIcon icon={faChartBar} />
      </Button>
      <canvas></canvas>
    </Fragment>
  );
};

export default ExportChart;
/* 
var btn = document.getElementById('boton');
var svg = document.getElementById('mysvg');
var canvas = document.getElementById('dacanvas');

function triggerDownload(imgURI) {
  var evt = new MouseEvent('click', {
    view: window,
    bubbles: false,
    cancelable: true,
  });

  var a = document.createElement('a');
  a.setAttribute('download', 'MY_COOL_IMAGE.png');
  a.setAttribute('href', imgURI);
  a.setAttribute('target', '_blank');
  console.log('It dispatches');
  a.dispatchEvent(evt);
}

btn.addEventListener('click', function () {
  var ctx = canvas.getContext('2d');
  var data = new XMLSerializer().serializeToString(svg);
  var DOMURL = window.URL || window.webkitURL || window;

  var img = new Image();
  var svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
  var url = DOMURL.createObjectURL(svgBlob);
  console.log('It calls');

  img.onload = function () {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    DOMURL.revokeObjectURL(url);
    console.log('It draws');
    var imgURI = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');

    triggerDownload(imgURI);
  };

  img.src = url;
});
 */
