/* eslint import/no-extraneous-dependencies: 0 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import renderer from 'react-test-renderer';

import Transition from '../TransitionView';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#AF2222',
    width: 200,
    height: 220,
    position: 'absolute',
    left: 200 * 0.5 - 100,
    top: 600 * 0.5 - 100,
    transform: [{ rotate: '-20deg' }],
  },
  container2: {
    backgroundColor: '#AA020222',
    position: 'absolute',
    left: 0,
    top: 100,
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 70,
    padding: 10,
  },
  container3: {
    transform: [{ rotate: '90deg' }],
  },
});

describe('Transition', () => {
  it('Renders rotation', () => {
    const single = renderer.create(<View style={styles.container3} />);
    const classTree = renderer.create(<Transition><View style={styles.container3} /></Transition>);
    writeTree(single);
    writeTree(classTree.toJSON());
  });
});

const writeTree = (root) => {
  console.log(JSON.stringify(root));
};
