import React from 'react';
import useBearStore from './store/bears';

function Controls() {
  const increasePopulation = useBearStore((state) => state.increasePopulation);
  const removeAllBears = useBearStore((state) => state.removeAllBears);
  const updateBears = useBearStore((state) => state.updateBears);

  return (
    <div>
      <button onClick={increasePopulation}>One up</button>
      <button onClick={removeAllBears}>Remove all</button>
      <button onClick={() => updateBears(5)}>Set to 5</button>
    </div>
  );
}

export default Controls;
