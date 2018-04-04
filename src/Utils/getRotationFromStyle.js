import { StyleSheet } from 'react-native';

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

const getRotationFromStyle = (style) => {
  if(!style) return null;
  let flattenedStyle = style;
  if(isNumber(style)){
    flattenedStyle = StyleSheet.flatten(style);
  }
  const rotationInfo = flattenedStyle.transform ? {
    rotate: flattenedStyle.transform.find(i => i.rotate),
    rotateX: flattenedStyle.transform.find(i => i.rotateX),
    rotateY: flattenedStyle.transform.find(i => i.rotateY),
  } : {};

  if(rotationInfo === {}) return null;

  return rotationInfo;
}

export { getRotationFromStyle };