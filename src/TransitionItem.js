import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Metrics } from './Types/Metrics';
import { getRotationFromStyle, getBoundingBox, getOriginalRect } from './Utils';

type Size = {
  x: number,
  y: number
}

export default class TransitionItem {
  constructor(
    name: string, route: string, reactElement: Object,
    shared: boolean, appear: string, disappear: string,
    delay: boolean, index: number,
  ) {
    this.name = name;
    this.route = route;
    this.reactElement = reactElement;
    this.shared = shared;
    this.appear = appear;
    this.disappear = disappear;
    this.delay = delay;
    this.index = index;
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
  boundingBoxMetrics: Metrics
  index: number

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
    const t = getRotationRad(ri);

    if (t !== 0) {
      const r = getOriginalRect({
        boundingBox: { x, y, width, height },
        theta: t,
        skipWidth: Platform.OS !== 'ios',
      });

      this.metrics = {
        x: r.x - viewMetrics.x,
        y: r.y - viewMetrics.y,
        width: r.width,
        height: r.height,
      };

      this.boundingBoxMetrics = getBoundingBox({ rect: this.metrics, theta: t});

    } else {
      this.metrics = { x: x - viewMetrics.x, y: y - viewMetrics.y, width, height };
      this.boundingBoxMetrics = this.metrics;
    }    
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

const getRotationRad = (ri) => {
  if (ri.type === 'deg') return getDegreesToRadians(ri.value);
  return ri.value;
}

const getRotationDeg = (ri) => {
  if (ri.type === 'rad') return getRadiansToDegrees(ri.value);
  return ri.value;
}

const getDegreesToRadians = (degrees: number): number => degrees * Math.PI / 180;
const getRadiansToDegrees = (rad: number): number => rad * 180 / Math.PI;

