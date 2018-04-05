import React from 'react';
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
});
