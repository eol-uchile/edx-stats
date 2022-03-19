import React, { useEffect } from 'react';
/**
 * Show a step-by-step tour when localCondition
 * is true and the page is visited for the first time.
 * Add a key to the local Storage.
 * Allow to show the tutorial by calling the returned function.
 * @param {Object} steps
 * @param {Boolean} localCondition
 * @param {String} storagedItem
 * @returns
 */
function useShowTutorial(steps, localCondition, storagedItem) {
  const showTutorial = () => {
    introJs()
      .setOptions({
        steps: steps,
        showBullets: false,
        showProgress: true,
        prevLabel: 'Atrás',
        nextLabel: 'Siguiente',
        doneLabel: 'Finalizar',
        keyboardNavigation: true,
      })
      .start()
      .onexit(() => window.scrollTo({ behavior: 'smooth', top: 0 }));
  };
  useEffect(() => {
    if (localCondition && localStorage.getItem(storagedItem) === null) {
      showTutorial();
      localStorage.setItem(storagedItem, 'seen');
    }
  }, [localCondition]);

  return showTutorial;
}

export default useShowTutorial;
