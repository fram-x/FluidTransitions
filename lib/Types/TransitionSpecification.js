import { Animated } from 'react-native';
import { Metrics } from './Metrics';
import { RouteDirection } from './Direction';

export type ScreenSize = {
  width: number,
  height: number,
};

export type TransitionSpecification = {
  progress: Animated.Value,
  direction: RouteDirection,
  metrics: Metrics,
  boundingbox: Metrics,
  name: string,
  route: string,
  start: number,
  end: number,
  dimensions: ScreenSize,
}
