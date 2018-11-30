import { StyleSheet } from 'react-native';
import TransitionItem from '../TransitionItem';

export const getResolvedMetrics = (item: TransitionItem, metrics: any) => {
  const style = item.getItemStyle();
  const margins = getMarginsFromStyle(style);
  if (margins) {
    return {
      x: metrics.x - margins.left,
      y: metrics.y - margins.top,
      width: metrics.width,
      height: metrics.height,
    };
  }
  return metrics;
};

const getMarginsFromStyle = (style: StyleSheet.Style) => {
  const retVal = { left: 0, top: 0, bottom: 0, right: 0 };
  if (!style) return retVal;
  if (style.margin) {
    retVal.left = style.margin;
    retVal.top = style.margin;
    retVal.right = style.margin;
    retVal.bottom = style.margin;
  }

  if (style.marginHorizontal) {
    retVal.left = style.marginHorizontal;
    retVal.right = style.marginHorizontal;
  }

  if (style.marginVertical) {
    retVal.top = style.marginVertical;
    retVal.bottom = style.marginVertical;
  }

  if (style.marginTop) retVal.top = style.marginTop;
  if (style.marginLeft) retVal.left = style.marginLeft;
  if (style.marginRight) retVal.right = style.marginRight;
  if (style.marginBottom) retVal.bottom = style.marginBottom;

  return retVal;
};
