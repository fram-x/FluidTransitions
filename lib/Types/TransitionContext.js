import { NavigationDirection } from './Direction';

export type TransitionContext = {
  delayCountFrom: number,
  delayCountTo: number,
  navDirection: NavigationDirection,
  delayIndexFrom: number,
  delayIndexTo: number,
  delayToFactor: number,
  delayFromFactor: number,
  getDirectionForRoute: Function,
  getIndex: Function,
  getTransitionProgress: Function,
  getRoutes: Function,
}
