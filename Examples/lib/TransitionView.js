import React from 'react';

import SharedTransition from './Transitions/SharedTransition';
import BaseTransition from './Transitions/BaseTransition';
import ScaleTransition from './Transitions/ScaleTransitions';

class Transition extends React.Component {
	render() {
		let component;
		// Find correct name
		if(this.props.shared){
			component = React.createElement(SharedTransition, this.props);
		}
		else {
			if(this.props.appear){
				switch(this.props.appear){
					case 'top':
					case 'bottom':
					case 'left':
					case 'right':
						component = React.createElement(BaseTransition, this.props);
						break;
					case 'scale':
						component = React.createElement(ScaleTransition, this.props);
						break;
				}
			}
			else
				component = React.createElement(BaseTransition, this.props);			
		}

		return component;
	}
}

export default Transition;