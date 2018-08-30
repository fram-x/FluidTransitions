import createFluidNavigator from './createFluidNavigator';

export default (routeConfigMap, stackConfig = {}) => createFluidNavigator(
  routeConfigMap, stackConfig,
);
