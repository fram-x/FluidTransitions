import React from 'react';
import { View } from 'react-native';

class CircleInClass extends React.Component {
  render() {
    return (
      <View
        style={{
          width: this.props.size,
          height: this.props.size,
          borderRadius: this.props.size / 2,
        }}
      />);
  }
}

const CircleFunc = (props) => (
  <View
    style={{
      width: props.size,
      height: props.size,
      borderRadius: props.size / 2,
    }}
  />
);

export { CircleFunc, CircleInClass };
