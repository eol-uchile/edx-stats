import React from 'react';
import { faArrowCircleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PullUp = () => (
  <span
    title="Subir"
    onClick={() => window.scrollTo({ behavior: 'smooth', top: 0 })}
  >
    <FontAwesomeIcon icon={faArrowCircleUp} className="pull-up-arrow" />
  </span>
);

export default PullUp;
