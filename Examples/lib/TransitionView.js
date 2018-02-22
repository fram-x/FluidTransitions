import React from 'react';

import SharedTransition from './Transitions/SharedTransition';
import BaseTransition from './Transitions/BaseTransition';
import ScaleTransition from './Transitions/ScaleTransitions';
import TopTransition from './Transitions/TopTransition';
import BottomTransition from './Transitions/BottomTransition';
import LeftTransition from './Transitions/LeftTransition';
import RightTransition from './Transitions/RightTransition';
import HorizontalTransition from './Transitions/HorizontalTransition';
import VerticalTransition from './Transitions/VerticalTransition';

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
					return React.createElement(LeftTransition, this.props);
				case 'right':
					return React.createElement(RightTransition, this.props);
				case 'horizontal':
					return React.createElement(HorizontalTransition, this.props);
				case 'vertical':				
					return React.createElement(VerticalTransition, this.props);
				case 'scale':
					return React.createElement(ScaleTransition, this.props);
			}
		}
		else
			return React.createElement(BaseTransition, this.props);
	}
}

export default Transition;