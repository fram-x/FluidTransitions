import React from 'react';

export type Size = {
  x: number,
  y: number
}

export type Metrics = {
  x: number,
  y: number,
  width: number,
  height: number,
}

export default class TransitionItem {
  constructor(name: string, route: string, reactElement: Object, 
      shared: boolean, appear: boolean, delay: boolean, metrics: Metrics) {
    this.name = name;
    this.route = route;
    this.reactElement = reactElement;
    this.shared = shared;
    this.appear = appear;
    this.delay = delay;
    this.metrics = metrics;
  }
  
  name: string
  route: string
  reactElement: Object
  metrics: Metrics
  shared: boolean
  appear: boolean
  delay: boolean
  layoutReady: boolean

  scaleRelativeTo(other: TransitionItem): Size {
    const validate = i => {
      if (!i.metrics) {
        throw `No metrics in ${i.name}:${i.containerRouteName}`;
      }
    };
    validate(this);
    validate(other);
    return {
      x: this.metrics.width / other.metrics.width,
      y: this.metrics.height / other.metrics.height,
    };
  }
  
  getReactElement(): Object {
    return this.reactElement.getReactElement();
  }

  clone(): TransitionItem {
    return new TransitionItem(
      this.name, this.route, this.reactElement, this.shared, this.appear, this.delay, this.metrics);
  }
}