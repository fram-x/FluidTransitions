import { Animated } from 'react-native';
import TransitionItem from './../TransitionItem';

export type TransitionConfiguration = {
  fromRoute: string,
  toRoute: string,
  sharedElements: Map<TransitionItem, TransitionItem>,
  transitionElements: Array<TransitionItem>,
  direction: number,
  config: Object,
  progress: Animated.Value
}
