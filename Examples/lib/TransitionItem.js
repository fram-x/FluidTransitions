import React from 'react';
import { UIManager, findNodeHandle } from 'react-native';

export default class TransitionItem {
	constructor(name, route, reactElement, isShared, appear, metrics) {
		this.name = name;
		this.route = route;
		this.reactElement = reactElement;
		this.isShared = isShared;		
		this.metrics = metrics;		
		this.appear = appear;
	}
	name
	route
	reactElement
	metrics	
	isShared
	appear
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
	measure(parentNodeHandle) {
		const nodeHandle = findNodeHandle(this.reactElement.getInnerViewRef());
		return new Promise((resolve, reject) => {
			UIManager.measureLayout(
				nodeHandle,
				parentNodeHandle,
				() => {
					reject();
				},
				(x, y, width, height) => {
					resolve({ x, y, width, height });
				}
			);
		});
	}
	clone() {
		return new TransitionItem(
			this.name, this.route, this.reactElement, this.isShared, this.appear, this.metrics);
	}
}