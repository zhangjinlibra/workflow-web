const opt = Object.prototype.toString;

export function isArray(obj) {
  return opt.call(obj) === "[object Array]";
}

export function isObject(obj) {
  return opt.call(obj) === "[object Object]";
}

export function isString(obj) {
  return opt.call(obj) === "[object String]";
}

export function isNumber(obj) {
  return opt.call(obj) === "[object Number]" && obj === obj; // eslint-disable-line
}

export function isRegExp(obj) {
  return opt.call(obj) === "[object RegExp]";
}

export function isFile(obj) {
  return opt.call(obj) === "[object File]";
}

export function isBlob(obj) {
  return opt.call(obj) === "[object Blob]";
}

export function isUndefined(obj) {
  return obj === undefined;
}

export function isNull(obj) {
  return obj === null;
}

export function isFunction(obj) {
  return typeof obj === "function";
}

export function isEmptyObject(obj) {
  return isObject(obj) && Object.keys(obj).length === 0;
}

export function isExist(obj) {
  return obj || obj === 0;
}

export function isWindow(el) {
  return el === window;
}
