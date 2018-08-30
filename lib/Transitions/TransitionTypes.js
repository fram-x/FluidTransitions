import { getScaleTransition } from './getScaleTransitions';
import { getTopTransition } from './getTopTransition';
import { getBottomTransition } from './getBottomTransition';
import { getLeftTransition } from './getLeftTransition';
import { getRightTransition } from './getRightTransition';
import { getHorizontalTransition } from './getHorizontalTransition';
import { getVerticalTransition } from './getVerticalTransition';
import { getFlipTransition } from './getFlipTransition';

type TransitionEntry = {
  name: string,
  transitionFunction: Function
}

const transitionTypes: Array<TransitionEntry> = [];

export function initTransitionTypes() {
  registerTransitionType('scale', getScaleTransition);
  registerTransitionType('top', getTopTransition);
  registerTransitionType('bottom', getBottomTransition);
  registerTransitionType('left', getLeftTransition);
  registerTransitionType('right', getRightTransition);
  registerTransitionType('horizontal', getHorizontalTransition);
  registerTransitionType('vertical', getVerticalTransition);
  registerTransitionType('flip', getFlipTransition);
  registerTransitionType('none', () => ({}));
}

export function registerTransitionType(name: string,
  transitionFunction: Function): TransitionEntry {
  transitionTypes.push({ name, transitionFunction });
}

export function getTransitionType(name: string): Function {
  const transitionType = transitionTypes.find(e => e.name === name);
  if (transitionType) return transitionType.transitionFunction;
  return null;
}
