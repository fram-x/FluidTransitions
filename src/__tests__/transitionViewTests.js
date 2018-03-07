import React from 'react';
import renderer from 'react-test-renderer';

import Transition from './../TransitionView';

import { CircleFunc, CircleInClass } from './mocks';

describe('TransitionView', () => {
  it('Renders a functional component the same as a class component', () => {
    const functionalTree = renderer.create(<Transition><CircleFunc /></Transition>).toJSON();
    const classTree = renderer.create(<Transition><CircleInClass /></Transition>).toJSON();

    expect(classTree.toString()).toEqual(functionalTree.toString());
  });
});
