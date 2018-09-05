import { getPositionInterpolator } from './getPositionInterpolator';
import { getScaleInterpolator } from './getScaleInterpolator';
import { getRotationInterpolator } from './getRotationInterpolator';
import { getBorderInterpolator } from './getBorderInterpolator';
import { getBackgroundInterpolator } from './getBackgroundInterpolator';

type InterpolatorEntry = {
  name: string,
  interpolatorFunction: (spec: InterpolatorSpecification) => InterpolatorResult,
}

const interpolators: Array<InterpolatorEntry> = [];

// This function can be called to register other transition functions
export function registerInterpolator(name: string,
  interpolatorFunction: Function): InterpolatorEntry {
  interpolators.push({ name, interpolatorFunction });
}

export function initInterpolatorTypes() {
  registerInterpolator('background', getBackgroundInterpolator);
  registerInterpolator('borderRadius', getBorderInterpolator);
  registerInterpolator('position', getPositionInterpolator);
  registerInterpolator('scale', getScaleInterpolator);
  registerInterpolator('rotation', getRotationInterpolator);
}

export function getInterpolatorTypes() : InterpolatorEntry {
  return interpolators;
}
