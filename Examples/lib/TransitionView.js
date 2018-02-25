import React from 'react';
import { View, Animated, UIManager, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import SharedTransition from './Transitions/SharedTransition';
import BaseAppearTransition from './Transitions/BaseAppearTransition';
import BaseTransition from './Transitions/BaseTransition';

let uniqueBaseId = `transitionCompId-${Date.now()}`;
let uuidCount = 0;

class Transition extends React.Component {
	constructor(props, context){
		super(props, context);
		this._name = `${uniqueBaseId}-${uuidCount++}`;
	}

	_name
	_route

	render() {
		console.log("TransitionView render");

		let element = React.Children.only(this.props.children);
		if(element.type.name==='Button')
			element = (<View>{element}</View>);

		const animatedComp = Animated.createAnimatedComponent(element.type);

		const style =  [element.props.style];
		const appearStyle = this.getAppearStyle();
		// TODO: Use helper to generate transitionStyle
		// const transitionStyle = this.getTransitionStyle(this.state.transitionConfiguration);

		const props = {
			...this.props,
			onLayout: this.onLayout.bind(this),
			collapsable: false,
			style: [style, appearStyle],
			ref: (ref) => this._viewRef = ref
		};

		return React.createElement(animatedComp, props);
	}

	getAppearStyle() {
		if(this.props.appear)
			return {};
			
		const interpolator = this.context.appearProgress.interpolate({
			inputRange: [0, 1],
			outputRange: [1, 0]
		});
		return { opacity: interpolator };
	}

	onLayout(event) {
		const self = this;
		//const nodeHandle = findNodeHandle(this._viewRef);
		//UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
			const { updateMetrics } = self.context;
			if(!updateMetrics) return;
			updateMetrics(self._getName(), self._route, this._viewRef);
			//console.log("TransitionView onLayout: x:" + x + " y:" + y + " w:" + width + " h:" + height);
		//});

	}

	_getName(){
		if(this.props.shared)
			return this.props.shared;
		return this._name;
	}

	static contextTypes = {
		register: PropTypes.func,
		unregister: PropTypes.func,
		updateMetrics: PropTypes.func,
		route: PropTypes.string,
		appearProgress: PropTypes.object
	}

	componentWillMount() {
		const register = this.context.register;
		if(register) {
			this._route = this.context.route;
			register(new TransitionItem(this._getName(), this.context.route,
				this, this.props.shared !== undefined, this.props.appear !== undefined,
				this.props.nodelay !== undefined));
		}
	}

	componentWillUnmount() {
		const unregister = this.context.unregister;
		if(unregister) {
			unregister(this._getName(), this._route);
		}
	}
}

export default Transition;