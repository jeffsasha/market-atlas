'use client';

import { useEffect, useState } from 'react';
import DotField from './DotField/DotField';

export default function GlobalBackground() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update(); document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return <DotField paused={hidden} />;
}
