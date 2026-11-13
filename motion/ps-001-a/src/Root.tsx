import React from 'react';
import {Composition} from 'remotion';
import {PSOpening} from './PSOpening';

export const Root: React.FC = () => (
  <>
    {/* v1.1 : signature en Inter Regular (charte PS-DOC-001) */}
    <Composition id="PSOpening" component={PSOpening} durationInFrames={375} fps={25} width={1920} height={1080}
      defaultProps={{signatureFont: 'inter' as const}} />
    {/* v1.0 : signature en Montserrat (dessin d'origine du logo) */}
    <Composition id="PSOpening-Montserrat" component={PSOpening} durationInFrames={375} fps={25} width={1920} height={1080}
      defaultProps={{signatureFont: 'montserrat' as const}} />
  </>
);
