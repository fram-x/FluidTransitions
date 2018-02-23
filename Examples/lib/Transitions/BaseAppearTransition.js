import React from 'react';

import BaseTransition from './BaseTransition';

class BaseAppearTransition extends BaseTransition {	
	setTransitionSpec(value){
		if(value === null)
			this.setState({...this.state, transitionConfiguration: value});
		else if(value !== null)
			this.setState({...this.state, transitionConfiguration: {
				...value,
				progress: this._transitionProgress}
		});
	}

	getTransitionStyle(transitionConfiguration){
		const transitionHelper = this.getTransitionHelper(this.props.appear);
		let style = {};
		if(transitionHelper !== null)
			style = transitionHelper.getTransitionStyle(transitionConfiguration);

		return style;
	}
	
}

export default BaseAppearTransition;