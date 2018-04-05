import React from 'react';
import { View } from 'react-native';
import renderer from 'react-test-renderer';

import Transition from './../TransitionView';

import { CircleFunc, CircleInClass } from './../__mocks__/Components';

describe('Transition', () => {
  it('Renders a functional component the same as a class component', () => {
    const functionalTree = renderer.create(<Transition><CircleFunc size={20} background="#FF0000" /></Transition>).toJSON();
    const classTree = renderer.create(<Transition><CircleInClass /></Transition>).toJSON();
    expect(classTree.toString()).toEqual(functionalTree.toString());
  });

  it('Renders a component with collapsable set to false', () => {
    const classTree = renderer.create(<Transition><CircleInClass /></Transition>).toJSON();
    expect(classTree.props.collapsable).toEqual(false);
  });

  it('Renders a component with overflow hidden set', () => {
    const classTree = renderer.create(<Transition><CircleInClass /></Transition>).toJSON();
    expect(classTree.props.style.overflow).toEqual('hidden');
  });

  it('Renders a component with background moved to outer view', () => {
    const classTree = renderer.create(<Transition><View style={{ backgroundColor: '#FF0000' }} /></Transition>).toJSON();
    expect(classTree.props.style.backgroundColor).toEqual('#FF0000');
    expect(classTree.children[0].props.style.backgroundColor).toBeUndefined();
  });

  it('Renders a component with position moved to outer view', () => {
    const classTree = renderer.create(<Transition><View style={{ position: 'absolute' }} /></Transition>).toJSON();
    expect(classTree.props.style.position).toEqual('absolute');
    expect(classTree.children[0].props.style.position).toBeUndefined();
  });

  it('Renders a component with rotate transform moved to outer view', () => {
    const classTree = renderer.create(<Transition><View style={{ transform: [{ rotate: '10deg' }] }} /></Transition>).toJSON();
    expect(classTree.props.style.transform).toEqual([{ rotate: '10deg' }]);
    expect(classTree.children[0].props.style.transform).toBeUndefined();
  });

  it('Renders a component with translate transform removed', () => {
    const classTree = renderer.create(<Transition><View style={{ transform: [{ translateX: 100 }] }} /></Transition>).toJSON();
    expect(classTree.props.style.transform).toBeUndefined();
    expect(classTree.children[0].props.style.transform).toBeUndefined();
  });

  it('Renders a component with opacity kept in the inner view', () => {
    const classTree = renderer.create(<Transition><View style={{ opacity: 0.5 }} /></Transition>).toJSON();
    expect(classTree.children[0].props.style.opacity).toEqual(0.5);
  });
});
