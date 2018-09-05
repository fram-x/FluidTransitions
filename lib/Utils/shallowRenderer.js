/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactShallowRendererEntry
 * @preventMunge
 */


const checkPropTypes = require('prop-types/checkPropTypes');
const React = require('react');

const emptyObject = require('fbjs/lib/emptyObject');
const invariant = require('fbjs/lib/invariant');

class ShallowRenderer {
  static createRenderer = function () {
    return new ShallowRenderer();
  };

  constructor() {
    this._context = null;
    this._element = null;
    this._instance = null;
    this._newState = null;
    this._rendered = null;
    this._rendering = false;
    this._forcedUpdate = false;
    this._updater = new Updater(this);
  }

  getMountedInstance() {
    return this._instance;
  }

  getRenderOutput() {
    return this._rendered;
  }

  render(element, context = emptyObject) {
    if (this._rendering) {
      return;
    }

    this._rendering = true;
    this._element = element;
    this._context = context;

    if (this._instance) {
      this._updateClassComponent(element.props, context);
    } else if (shouldConstruct(element.type)) {
      this._instance = new element.type(
        element.props,
        context,
        this._updater,
      );

      if (element.type.hasOwnProperty('contextTypes')) {
        currentlyValidatingElement = element;
        currentlyValidatingElement = null;
      }
      this._mountClassComponent(element.props, context);
    } else if (typeof element.type === 'function') {
      this._rendered = element.type(element.props, context);
    } else {
      this._rendered = element.type.render(element.props, context);
    }

    this._rendering = false;

    return this.getRenderOutput();
  }

  unmount() {
    if (this._instance) {
      if (typeof this._instance.componentWillUnmount === 'function') {
        this._instance.componentWillUnmount();
      }
    }

    this._context = null;
    this._element = null;
    this._newState = null;
    this._rendered = null;
    this._instance = null;
  }

  _mountClassComponent(props, context) {
    this._instance.context = context;
    this._instance.props = props;
    this._instance.state = this._instance.state || emptyObject;
    this._instance.updater = this._updater;

    if (typeof this._instance.componentWillMount === 'function') {
      const beforeState = this._newState;

      this._instance.componentWillMount();

      // setState may have been called during cWM
      if (beforeState !== this._newState) {
        this._instance.state = this._newState || emptyObject;
      }
    }

    this._rendered = this._instance.render();
    // Intentionally do not call componentDidMount()
    // because DOM refs are not available.
  }

  _updateClassComponent(props, context) {
    const oldProps = this._instance.props;

    if (
      oldProps !== props
      && typeof this._instance.componentWillReceiveProps === 'function'
    ) {
      this._instance.componentWillReceiveProps(props, context);
    }

    // Read state after cWRP in case it calls setState
    // Fallback to previous instance state to support rendering React.cloneElement()
    const state = this._newState || this._instance.state || emptyObject;

    if (typeof this._instance.shouldComponentUpdate === 'function') {
      if (
        this._forcedUpdate
        || this._instance.shouldComponentUpdate(props, state, context) === false
      ) {
        this._instance.context = context;
        this._instance.props = props;
        this._instance.state = state;
        this._forcedUpdate = false;

        return;
      }
    }

    if (typeof this._instance.componentWillUpdate === 'function') {
      this._instance.componentWillUpdate(props, state, context);
    }

    this._instance.context = context;
    this._instance.props = props;
    this._instance.state = state;

    this._rendered = this._instance.render();
    // Intentionally do not call componentDidUpdate()
    // because DOM refs are not available.
  }
}

class Updater {
  constructor(renderer) {
    this._renderer = renderer;
  }

  isMounted(publicInstance) {
    return !!this._renderer._element;
  }

  enqueueForceUpdate(publicInstance, callback, callerName) {
    this._renderer._forcedUpdate = true;
    this._renderer.render(this._renderer._element, this._renderer._context);

    if (typeof callback === 'function') {
      callback.call(publicInstance);
    }
  }

  enqueueReplaceState(publicInstance, completeState, callback, callerName) {
    this._renderer._newState = completeState;
    this._renderer.render(this._renderer._element, this._renderer._context);

    if (typeof callback === 'function') {
      callback.call(publicInstance);
    }
  }

  enqueueSetState(publicInstance, partialState, callback, callerName) {
    const currentState = this._renderer._newState || publicInstance.state;

    if (typeof partialState === 'function') {
      partialState = partialState(currentState, publicInstance.props);
    }

    this._renderer._newState = {
      ...currentState,
      ...partialState,
    };

    this._renderer.render(this._renderer._element, this._renderer._context);

    if (typeof callback === 'function') {
      callback.call(publicInstance);
    }
  }
}

var currentlyValidatingElement = null;

function shouldConstruct(Component) {
  return !!(Component.prototype && Component.prototype.isReactComponent);
}

export default ShallowRenderer;
