import { Animated } from 'react-native';
import { Metrics } from './Metrics';
import { RouteDirection, NavigationDirection } from './Direction';

export type TransitionContext = {
  route: string,
  register: (string, string) => void,
  unregister: (string, string) => void,
  getDirectionForRoute: (string, string) => RouteDirection,
  getReverseForRoute: (string, string) => boolean,
  getDirection: () => NavigationDirection,
  sharedProgress: Animated.Value,
  hiddenProgress: Animated.Value,
  getTransitionProgress: () => Animated.Value,
  getIsSharedElement: (string, string) => boolean,
  getIsTransitionElement: (string, string) => boolean,
  getMetrics: (string, string) => Metrics,
}
