import React from 'react';

import SharedTransition from './Transitions/SharedTransition';
import BaseTransition from './Transitions/BaseTransition';

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
					case 'scale':
				}
			}
			component = React.createElement(BaseTransition, this.props);
		}

		return component;
	}
}

export default Transition;