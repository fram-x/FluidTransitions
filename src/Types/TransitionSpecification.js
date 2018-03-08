import { Animated, ScaledSize } from 'react-native';
import { Metrics } from './Metrics';

export type TransitionSpecification = {
  progress: Animated.Value,
  direction: number,
  metrics: Metrics,
  reverse: boolean,
  name: string,
  route: string,
  dimensions: ScaledSize
}
