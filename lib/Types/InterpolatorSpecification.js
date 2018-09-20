import { Metrics } from './Metrics';

export type InterpolatorSpecification = {
  from: {
    metrics: Metrics,
    boundingbox: Metrics,
    style: any,
  },
  to: {
    metrics: Metrics,
    boundingbox: Metrics,
    style: any,
  },
  scaleX: number,
  scaleY: number,
  dimensions: any,
  equalAspectRatio: boolean,
  getInterpolation: (useNativeDriver: Boolean) => any,
}
