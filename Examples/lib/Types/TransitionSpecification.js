import { Animated } from 'react-native';
import { Metrics } from './Metrics';

export type TransitionSpecification = {
  progress: Animated.Value,
  direction: number,
  metrics: Metrics,
  start: number,
  end: number,
  reverse: boolean,
}
