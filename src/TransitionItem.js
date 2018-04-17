import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Metrics } from './Types/Metrics';
import { getRotationFromStyle, getOriginalRect } from './Utils';

type Size = {
  x: number,
  y: number
}

export default class TransitionItem {
  constructor(
    name: string, route: string, reactElement: Object,
    shared: boolean, appear: string, disappear: string,
    delay: boolean,
  ) {
    this.name = name;
    this.route = route;
    this.reactElement = reactElement;
    this.shared = shared;
    this.appear = appear;
    this.disappear = disappear;
    this.delay = delay;
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
  flattenedStyle: ?any

  getNodeHandle() {
    return this.reactElement.getNodeHandle();
  }

  getViewRef() {
    return this.reactElement.getViewRef();
  }

  getFlattenedStyle() {
    if (!this.flattenedStyle) {
      const child = React.Children.only(this.reactElement.props.children);
      const { style } = child.props;
      if (!style) return null;
      this.flattenedStyle = StyleSheet.flatten(style);
    }
    return this.flattenedStyle;
  }

  updateMetrics(viewMetrics: Metrics, itemMetrics: Metrics) {
    const { x, y, width, height } = itemMetrics;

    const ri = this.getRotation();
    const t = this.getRotationRad(ri);

    if (t !== 0) {
      const r = getOriginalRect({
        boundingBox: { x, y, width, height },
        theta: t,
        skipWidth: Platform.OS === 'android',
      });
      this.metrics = { x: r.x - viewMetrics.x, y: r.y - viewMetrics.y, width: r.width, height: r.height };
    } else {
      this.metrics = { x: x - viewMetrics.x, y: y - viewMetrics.y, width, height };
    }

    // console.log({
    //   r: `${this.name}/${this.route}`,
    //   org: { x: itemMetrics.x, y: itemMetrics.y, width: itemMetrics.width, height: itemMetrics.height },
    //   new: { x: this.metrics.x, y: this.metrics.y, width: this.metrics.width, height: this.metrics.height },
    // });
  }

  getRotation() {
    const ri = getRotationFromStyle(this.getFlattenedStyle());
    let retVal = { type: 'unknown', value: 0 };
    if (ri.rotate) {
      if (ri.rotate.rotate) {
        const rotation: String = ri.rotate.rotate;
        if (rotation.endsWith('deg')) {
          retVal = { type: 'deg', value: parseInt(rotation.substring(0, rotation.length - 3)) };
        } else if (rotation.endsWith('rad')) {
          retVal = { type: 'rad', value: parseInt(rotation.substring(0, rotation.length - 3)) };
        }
      }
    }
    return retVal;
  }

  getRotationRad(ri) {
    if (ri.type === 'deg') return this.getDegreesToRadians(ri.value);
    return ri.value;
  }

  getRotationDeg(ri) {
    if (ri.type === 'rad') return this.getRadiansToDegrees(ri.value);
    return ri.value;
  }

  getDegreesToRadians = (degrees: number): number => degrees * Math.PI / 180;
  getRadiansToDegrees = (rad: number): number => rad * 180 / Math.PI;

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

