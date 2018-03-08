import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

type TransitionRouteViewProps = {
  children: Array<any>,
  style: ?any,
  route: string
}
class TransitionRouteView extends React.Component<TransitionRouteViewProps> {
  static childContextTypes = {
    route: PropTypes.string,
  }

  getChildContext() {
    return {
      route: this.props.route
    };
  }

  render() {
    return (
      <View style={this.props.style}>
        {this.props.children}
      </View>
    );
  }
}

export default TransitionRouteView;