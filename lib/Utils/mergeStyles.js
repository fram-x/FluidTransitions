import { StyleSheet } from 'react-native';

const mergeStyles = (styles: Array<any>): StyleSheet.Styles => {
  const retVal = { transform: [] };
  styles.forEach(style => {
    if (style) {
      let flattenedStyle = style;
      if (isNumber(flattenedStyle)) { flattenedStyle = StyleSheet.flatten(flattenedStyle); }

      Object.keys(flattenedStyle).forEach(key => {
        if (flattenedStyle[key] && flattenedStyle[key] instanceof Array) {
          const a = flattenedStyle[key];
          if (!retVal[key]) retVal[key] = [];
          a.forEach(i => retVal[key].push(i));
        } else if (flattenedStyle[key]) {
          retVal[key] = flattenedStyle[key];
        }
      });
    }
  });

  return retVal;
};

function isNumber(n) { return !Number.isNaN(parseFloat(n)) && !Number.isNaN(n - 0); }

export { mergeStyles };
