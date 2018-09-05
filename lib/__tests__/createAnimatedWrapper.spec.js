/* eslint import/no-extraneous-dependencies: 0 */
import React from 'react';
import { View } from 'react-native';
import renderer from 'react-test-renderer';

import { createAnimatedWrapper } from '../Utils';
import { CircleFunc, CircleInClass } from '../__mocks__/Components';

describe('createAnimatedWrapper', () => {
  it('Renders a functional component the same as a class component', () => {
    const functionalTree = getClassTree(<CircleFunc size={20} background="#FF0000" />);
    const classTree = getClassTree(<CircleInClass />);
    expect(classTree.toString()).toEqual(functionalTree.toString());
  });

  it('Renders a component with collapsable set to false', () => {
    const classTree = getClassTree(<View style={{ backgroundColor: '#FF0000' }} />);
    expect(classTree.props.collapsable).toEqual(false);
  });

  it('Renders a component with background kept in inner view', () => {
    const classTree = getClassTree(<View style={{ backgroundColor: '#FF0000' }} />);
    expect(classTree.props.style.backgroundColor).toBeUndefined();
    expect(classTree.children[0].props.style.backgroundColor).toEqual('#FF0000');
  });

  it('Renders a component with position moved to outer view', () => {
    const classTree = getClassTree(<View style={{ position: 'absolute' }} />);
    expect(classTree.props.style.position).toEqual('absolute');
    expect(classTree.children[0].props.style.position).toBeUndefined();
  });

  it('Renders a component with rotate transform moved to outer view', () => {
    const classTree = getClassTree(<View style={{ transform: [{ rotate: '10deg' }] }} />);
    expect(classTree.props.style.transform).toEqual([{ rotate: '10deg' }]);
    expect(classTree.children[0].props.style.transform).toBeUndefined();
  });

  it('Renders a component with opacity kept in the inner view', () => {
    const classTree = getClassTree(<View style={{ opacity: 0.5 }} />);
    expect(classTree.children[0].props.style.opacity).toEqual(0.5);
  });
});

const getClassTree = (component) => {
  const MyComp = () => (createAnimatedWrapper({ component }));
  return renderer.create(<MyComp />).toJSON();
};
