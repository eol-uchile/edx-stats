import React, { useEffect } from 'react';

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
