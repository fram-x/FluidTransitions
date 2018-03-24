import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';

type TransitionRouteViewProps = {
  children: Array<any>,
  style: ?any,
  route: string,
  sceneKey: ?string,
}

class TransitionRouteView extends React.Component<TransitionRouteViewProps> {
  static childContextTypes = {
    route: PropTypes.string,    
  }

  static contextTypes = {
    onScreenDidMount: PropTypes.func,
  }

  componentDidMount() {
    const { onScreenDidMount } = this.context;
    if(!onScreenDidMount || !this.props.sceneKey) return;
    onScreenDidMount(this.props.sceneKey);
  }

  getChildContext() {
    return {
      route: this.props.route,      
    };
  }

  render() {
    return (
      <Animated.View style={this.props.style}>
        {this.props.children}
      </Animated.View>
    );
  }
}

export default TransitionRouteView;