import React from 'react';
import {Composition} from 'remotion';
import {PSOpening} from './PSOpening';

export const Root: React.FC = () => (
  <Composition id="PSOpening" component={PSOpening} durationInFrames={375} fps={25} width={1920} height={1080} />
);
