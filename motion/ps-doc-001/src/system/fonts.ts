import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/sora/600.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

/** Bloque le rendu tant que les polices de la charte ne sont pas chargées. */
export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender('polices de la charte'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('700 40px "Space Grotesk"'),
      document.fonts.load('600 40px Sora'),
      document.fonts.load('400 40px Inter'),
      document.fonts.load('500 40px Inter'),
    ]).then(() => continueRender(handle));
  }, [handle]);
};
