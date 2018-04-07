import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Metrics } from './Types/Metrics';
import { getRotationFromStyle } from './Utils';

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

  updateMetrics(viewMetrics: Metrics, itemMetrics: Metrics) {    
    const { x, y, width, height } = itemMetrics;
    const t = this.getRotationRad();
    
    if(t !== 0) {
      const rotWidth = Math.abs((1/(Math.pow(Math.cos(t),2)-Math.pow(Math.sin(t),2))) * 
        (width * Math.cos(t) - height * Math.sin(t)));

      const rotHeight = Math.abs((1/(Math.pow(Math.cos(t),2)-Math.pow(Math.sin(t),2))) * 
        (- width * Math.sin(t) + height * Math.cos(t)));
        
      const diffWidth = (width - rotWidth) * 0.5;
      const diffHeight = (height - rotHeight) * 0.5;
      this.metrics = {
        x: (x - viewMetrics.x) + diffWidth, 
        y: (y - viewMetrics.y) + diffHeight, 
        width: Platform.OS === 'ios' ? rotWidth : width, 
        height: Platform.OS === 'ios' ? rotHeight : height,
      };
    } else {
      this.metrics = {x: x - viewMetrics.x, y: y - viewMetrics.y, width, height };
    }
  }

  getRotationRad() {
    const ri = getRotationFromStyle(this.getFlattenedStyle());
    let retVal = 0;
    if(ri.rotate && ri.rotate.rotate){
      const rotation: String = ri.rotate.rotate;
      if(rotation.endsWith('deg')){
        let degrees = parseInt(rotation.substring(0, rotation.length-3));
        if(degrees < 0) degrees = degrees * -1;
        retVal = (degrees * Math.PI / 180);
      } else if(rotation.endsWith('rad')) {
        retVal = parseInt(rotation.substring(0, rotation.length-3));
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
