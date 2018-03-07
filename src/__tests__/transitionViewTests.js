import React from 'react';
import renderer from 'react-test-renderer';

import Transition from './../TransitionView';

import { CircleFunc, CircleInClass } from './mocks';

describe('TransitionView', () => {
  it('Wraps a functional component', () => {
    const tree = renderer.create(<Transition>
      <CircleFunc />
    </Transition>).toJSON();

    console.log(tree);
  });

  it('Wraps a class component', () => {
    const tree = renderer.create(<Transition>
      <CircleInClass />
    </Transition>).toJSON();
  });
});
