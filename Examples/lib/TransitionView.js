import React from 'react';

import SharedTransition from './Transitions/SharedTransition';
import BaseAppearTransition from './Transitions/BaseAppearTransition';

class Transition extends React.Component {
	render() {
		return createTransitionComponent(this.props);
	}
}

export const createTransitionComponent = (props) => {
	if(props.shared){
		return React.createElement(SharedTransition, props);
	}

	return React.createElement(BaseAppearTransition, props);
}

export default Transition;