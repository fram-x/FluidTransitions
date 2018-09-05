
const p = 0;
const padLength = 26;
const doLog = false;

export const log = (source, priority, callback) => {
  if (__DEV__) {
    if (callback && doLog && priority >= p) {
      console.log(getPaddedString(source) + callback());
    }
  }
};

const getPaddedString = (str) => {
  let len = padLength;
  if (str) {
    len = Math.max(0, len - str.length);
  }
  let pad = '';
  for (let i = 0; i < len; i++) pad += ' ';
  return str + pad;
};
