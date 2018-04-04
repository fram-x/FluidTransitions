import { StyleSheet } from 'react-native';

const mergeStyles = (styles: Array<any>): StyleSheet.NamedStyles => {
  const retVal = { transform: [] };
  styles.forEach(s => {
    if(s){
    Object.keys(s).forEach(key => {
      if(s[key] && s[key] instanceof Array){
        const a = s[key];
        if(!retVal[key]) retVal[key] = [];
        a.forEach(i => retVal[key].push(i));
      } else if(s[key]) {
        retVal[key] = s[key];
      }
    })
  }})

  return retVal;
}

export { mergeStyles };