import React from 'react';
import { UIManager, findNodeHandle } from 'react-native';

export default class TransitionItem {
	constructor(name, route, reactElement, shared, appear, immediate, metrics) {
		this.name = name;
		this.route = route;
		this.reactElement = reactElement;
		this.shared = shared !== undefined;		
		this.appear = appear !== undefined;
		this.immediate = immediate !== undefined;
		this.metrics = metrics;				
	}
	name
	route
	reactElement
	metrics	
	shared
	appear
	immediate
	scaleRelativeTo(other) {
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
	getReactElement() {
		return this.reactElement.getReactElement();
	}
	measure(size) {
		const nodeHandle = findNodeHandle(this.reactElement.getInnerViewRef());
		return new Promise((resolve, reject) => {
			UIManager.measureInWindow(
				nodeHandle,
				(x, y, width, height) => {
					resolve({ x: x - size.x, y: y - size.y, width, height });
				}
			);
		});
	}
	clone() {
		return new TransitionItem(
			this.name, this.route, this.reactElement, this.shared, this.appear, this.immediate, this.metrics);
	}
}