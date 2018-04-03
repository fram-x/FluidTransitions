import React from 'react';
import { StyleSheet } from 'react-native';
import { Metrics } from './Types/Metrics';

type Size = {
  x: number,
  y: number
}

export default class TransitionItem {
  constructor(
    name: string, route: string, reactElement: Object,
    shared: boolean, appear: string, disappear: string, 
    delay: boolean, modifiers: string
  ) {
    this.name = name;
    this.route = route;
    this.reactElement = reactElement;
    this.shared = shared;
    this.appear = appear;
    this.disappear = disappear;
    this.delay = delay;
    this.modifiers = modifiers;
  }

  name: string
  route: string
  reactElement: Object
  metrics: Metrics
  shared: boolean
  appear: string | Function
  disappear: string | Function
  delay: boolean
  modifiers: string
  layoutReady: boolean
  flattenedStyle: ?any

  getNodeHandle() {
    return this.reactElement.getNodeHandle();
  }

  getViewRef() {
    return this.reactElement.getViewRef();
  }

  getFlattenedStyle() {
    if(!this.flattenedStyle) {
      const child = React.Children.only(this.reactElement.props.children);
      const style = child.props.style;
      if(!style) return null;
      this.flattenedStyle = StyleSheet.flatten(style);
    }
    return this.flattenedStyle;
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
