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
    delay: boolean
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

    const ri = this.getRotation();
    const t = this.getRotationRad(ri);
    
    if(t !== 0) {
      
      const rotWidth = ((1.0 / ((Math.pow(Math.cos(t), 2) - Math.pow(Math.sin(t), 2)))) * 
        (width * Math.cos(t) - height * Math.sin(t)));

      const rotHeight = ((1.0 / ((Math.pow(Math.cos(t), 2) - Math.pow(Math.sin(t),2)))) * 
        (-width * Math.sin(t) + height * Math.cos(t)));

      const cos = Math.cos(t*-1);
      const sin = Math.sin(t*-1);
      const cx = x + viewMetrics.x + (rotWidth/2);
      const cy = y + viewMetrics.y + (rotHeight/2);
      const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
      const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        
      if(Platform.OS === 'ios'){             
        
        const a = this.getRotationDeg(ri);
        if((a > 90 && a < 180) || (a > 270 && a < 360)){
          // TODO: Fix wrong calculations
        }

        const diffWidth = (width - Math.abs(rotWidth)) * 0.5;
        const diffHeight = (height - Math.abs(rotHeight)) * 0.5;
        
        this.metrics = {
          x: nx, 
          y: ny, 
          width: Math.abs(rotWidth), 
          height: Math.abs(rotHeight),
        };     

      } else if(Platform.OS === 'android') {      
        this.metrics = {
          x: nx, 
          y: ny,  
          width, 
          height,
        };        
      } 
    } else {
      this.metrics = {x: x - viewMetrics.x, y: y - viewMetrics.y, width, height };        
    }
  }  

  getRotation() {
    const ri = getRotationFromStyle(this.getFlattenedStyle());
    let retVal = { type: 'unknown', value: 0};
    if(ri.rotate) {      
      if(ri.rotate.rotate){
        const rotation: String = ri.rotate.rotate;
        if(rotation.endsWith('deg')){
          retVal = { type: 'deg', value: Math.abs(parseInt(rotation.substring(0, rotation.length-3)))};
        } else if(rotation.endsWith('rad')) {
          retVal = { type: 'rad', value: parseInt(rotation.substring(0, rotation.length-3))};
        }
      }
    }
    return retVal;
  }

  getRotationRad(ri) {
    if(ri.type === 'deg') return this.getDegreesToRadians(ri.value);
    return ri.value;
  }

  getRotationDeg(ri) {
    if(ri.type === 'rad') return this.getRadiansToDegrees(ri.value);
    return ri.value;
  }

  getDegreesToRadians = (degrees: number): number => degrees * Math.PI / 180;
  getRadiansToDegrees = (rad: number): number => rad * 180/Math.PI;

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

