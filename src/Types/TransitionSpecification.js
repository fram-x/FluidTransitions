import { Animated, ScaledSize } from 'react-native';
import { Metrics } from './Metrics';
import { RouteDirection } from './Direction';

export type TransitionSpecification = {
  progress: Animated.Value,
  direction: RouteDirection,
  metrics: Metrics,
  reverse: boolean,
  name: string,
  route: string,
  start: number,
  end: number,
  dimensions: ScaledSize,
}
