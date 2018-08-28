import createFluidNavigator from './createFluidNavigator';

export default (routeConfigMap, stackConfig = {}) => {
  return createFluidNavigator(routeConfigMap, stackConfig);
};
