import React from 'react';

export default class TransitionItem {
	constructor(name, route, reactElement, shared, appear, nodelay, metrics) {
		this.name = name;
		this.route = route;
		this.reactElement = reactElement;
		this.shared = shared;		
		this.appear = appear;
		this.nodelay = nodelay;
		this.metrics = metrics;				
	}
	name
	route
	reactElement
	metrics	
	shared
	appear
	nodelay
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
	
	clone() {
		return new TransitionItem(
			this.name, this.route, this.reactElement, this.shared, this.appear, this.nodelay, this.metrics);
	}
}