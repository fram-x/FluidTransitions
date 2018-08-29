import * as React from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet } from 'react-native';

type TransitionRouteViewProps = {
  children: React.Node,
  style: StyleSheet.Styles,
  route: string,
  sceneKey: ?string,
}

class TransitionRouteView extends React.Component<TransitionRouteViewProps> {
  static childContextTypes = {
    route: PropTypes.string,
  }

  static contextTypes = {
    onSceneReady: PropTypes.func,
  }

  componentDidMount() {
    const { onSceneReady } = this.context;
    const { sceneKey } = this.props;
    if (!onSceneReady || !sceneKey) return;
    onSceneReady(sceneKey);
  }

  getChildContext() {
    const { route } = this.props;
    return {
      route,
    };
  }

  render() {
    const { style, children } = this.props;
    return (
      <Animated.View style={style}>
        {children}
      </Animated.View>
    );
  }
}

export default TransitionRouteView;
