import * as React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Screen } from 'react-native-screens';

const EPS = 1e-5;

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
    const { style, children, isActive, position, index } = this.props;
    const numericPosition = position.__getValue();
    const active = isActive
      || (numericPosition >= index - 1 && numericPosition <= index + 1 ? 1 : 0);

    return (
      <Screen
        style={style}
        active={active ? 1 : 0}
      >
        {children}
      </Screen>
    );
  }
}

export default TransitionRouteView;
