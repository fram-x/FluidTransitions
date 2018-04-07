import { AnimatedInterpolation, ScaledSize } from 'react-native';
import { Metrics } from './Metrics';
import { RouteDirection } from './Direction';

export type InterpolatorSpecification = {
  from: {
    metrics: Metrics,
    style: any,
  },
  to: {
    metrics: Metrics,
    style: any,
  },
  scaleX: number,
  scaleY: number,
  dimensions: ScaledSize,
  getInterpolation: (useNativeDriver) => AnimatedInterpolation,
  modifiers: string,
}
