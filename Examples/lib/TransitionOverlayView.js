import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

class TransitionOverlayView extends React.Component {
    constructor(props, context){
		super(props, context);
		this._transitionConfig = {};		
		this._forceUpdate = false;
		this._isMounted = false;
	}

	_transitionConfig
	_forceUpdate
	_isMounted

	setTransitionConfig(transitionConfig) {		
		this._transitionConfig = transitionConfig;
		this._forceUpdate = true;
		if(this._isMounted)
			this.forceUpdate();
	}

    render() {
        if(!this._transitionConfig.sharedElements){
            // console.log("TransitionOverlayView render empty");
			return null;
        }

		// console.log("TransitionOverlayView render");
		const self = this;		
		const sharedElements = this._transitionConfig.sharedElements.map((pair, idx) => {

            const {fromItem, toItem} = pair;
			const transitionStyle = self.getTransitionStyle(fromItem, toItem);

			// Buttons needs to be wrapped in a view to work properly.
			let element = React.Children.only(self._transitionConfig.direction === -1 ? 
				fromItem.reactElement.props.children : 
				toItem.reactElement.props.children);

			if(element.type.name === 'Button')
				element = (<View>{element}</View>);

			const AnimatedComp = Animated.createAnimatedComponent(element.type);
            const props = { ...element.props,
				style: [element.props.style, transitionStyle],				
                key: idx,
            };

			return React.createElement(AnimatedComp, props, element.props.children);
		});

		return (
			<Animated.View
				style={[styles.overlay, this.getAppearStyle()]}
				onLayout={this.props.onLayout}
				pointerEvents={'none'}
			>
				{sharedElements}
			</Animated.View>
		);
	}

	getAppearStyle() {
		const interpolator = this.context.sharedProgress.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1],
		});
		return { opacity: interpolator };
	}

    getTransitionStyle(fromItem, toItem) {
		const { progress } = this._transitionConfig;
		if(!progress) return {};

		const toVsFromScaleX = toItem.scaleRelativeTo(fromItem).x;
		const toVsFromScaleY = toItem.scaleRelativeTo(fromItem).y;

		const scaleX = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [1, toVsFromScaleX],
		});

		const scaleY = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [1, toVsFromScaleY],
		});

		const translateX = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [fromItem.metrics.x, toItem.metrics.x +
				fromItem.metrics.width/2 * (toVsFromScaleX-1)],
		});

		const translateY = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [fromItem.metrics.y, toItem.metrics.y +
				fromItem.metrics.height/2 * (toVsFromScaleY-1)],
		});

		return [styles.sharedElement, {
			width: fromItem.metrics.width,
			height: fromItem.metrics.height,
			transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }]
		}];
	}

	shouldComponentUpdate(nextProps, nextState) {
		const retVal = this._forceUpdate;
		this._forceUpdate = false;
		// console.log("TransitionOverlayView shouldUpdate " + retVal);
		return retVal;
	}

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	static contextTypes = {
		sharedProgress: PropTypes.object
	}
}

const styles = StyleSheet.create({
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
    },
    emptyOverlay: {
        position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	sharedElement: {
		position: 'absolute',
		// borderColor: '#34CE34',
		// borderWidth: 1,
		margin: 0,
		left: 0,
		top: 0,
	}
});

export default TransitionOverlayView;