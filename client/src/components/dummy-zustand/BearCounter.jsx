import React from 'react';
import useBearStore from './store/bears';

function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  return <h1>{bears} bears around here...</h1>;
}

export default BearCounter;
