import { Animated } from 'react-native';

import { Metrics } from './Types/Metrics';

type Size = {
  x: number,
  y: number
}

export default class TransitionItem {
  constructor(
    name: string, route: string, reactElement: Object,
    shared: boolean, appear: string, disappear: string, delay: boolean, metrics: Metrics) {
      
    this.name = name;
    this.route = route;
    this.reactElement = reactElement;
    this.shared = shared;
    this.appear = appear;
    this.disappear = disappear;
    this.delay = delay;
    this.metrics = metrics;
    this.visibility = new Animated.Value(appear ? 0 : 1);
    this.progress = null;
  }

  name: string
  route: string
  reactElement: Object
  metrics: Metrics
  shared: boolean
  appear: string | Function
  disappear: string | Function
  delay: boolean
  layoutReady: boolean
  visibility: Animated.Value
  progress: ?Animated.Value

  getNodeHandle() {
    return this.reactElement.getNodeHandle();
  }
  
  scaleRelativeTo(other: TransitionItem): Size {
    const validate = i => {
      if (!i.metrics) {
        throw new Error(`No metrics in ${i.name}:${i.containerRouteName}`);
      }
    };
    validate(this);
    validate(other);
    return {
      x: this.metrics.width / other.metrics.width,
      y: this.metrics.height / other.metrics.height,
    };
  }
}
