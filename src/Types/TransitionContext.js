import { Animated } from 'react-native';
import { Metrics } from './Metrics';

export type TransitionContext = {
  route: string,
  register: (string, string) => void,
  unregister: (string, string) => void,
  getDirection: (string, string) => number,
  getReverse: (string, string) => boolean,
  sharedProgress: Animated.Value,
  hiddenProgress: Animated.Value,
  getTransitionProgress: () => Animated.Value,
  getIsSharedElement: (string, string) => boolean,
  getIsTransitionElement: (string, string) => boolean,
  layoutReady: (string, string) => void,
  getMetrics: (string, string) => Metrics,
}
