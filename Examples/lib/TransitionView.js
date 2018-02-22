import React from 'react';

import SharedTransition from './Transitions/SharedTransition';
import BaseTransition from './Transitions/BaseTransition';
import ScaleTransition from './Transitions/ScaleTransitions';
import TopTransition from './Transitions/TopTransition';
import BottomTransition from './Transitions/BottomTransition';

class Transition extends React.Component {
	render() {
		// Find correct name
		if(this.props.shared){
			return React.createElement(SharedTransition, this.props);
		}

		if(this.props.appear){
			switch(this.props.appear){
				case 'top':
					return React.createElement(TopTransition, this.props);
				case 'bottom':
					return React.createElement(BottomTransition, this.props);
				case 'left':
				case 'right':
				case 'horizontal':
				case 'vertical':
					return React.createElement(BaseTransition, this.props);
				case 'scale':
					return React.createElement(ScaleTransition, this.props);
			}
		}
		else
			return React.createElement(BaseTransition, this.props);
	}
}

export default Transition;