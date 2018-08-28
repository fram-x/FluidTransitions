/* eslint import/no-extraneous-dependencies: 0 */
import React from 'react';
import renderer from 'react-test-renderer';

import Transition from '../TransitionView';

import { CircleFunc, CircleInClass } from '../__mocks__/Components';

describe('Transition', () => {
  it('Renders a functional component the same as a class component', () => {
    const functionalTree = renderer.create(<Transition><CircleFunc size={20} background="#FF0000" /></Transition>).toJSON();
    const classTree = renderer.create(<Transition><CircleInClass /></Transition>).toJSON();

    expect(classTree.toString()).toEqual(functionalTree.toString());
  });
});
