const toString = Object.prototype.toString;

// 对象复制
function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

// 正在表达式检测值是否为数值
function isNumber(value) {
  var regrex = new RegExp("^(-?\\d+)(\\.\\d+)?$");
  return typeof value === "number" ? true : regrex.test(value);
}

// 检测是否为对象
function isObject(value) {
  return Object.getPrototypeOf(value) === Object.prototype;
}

function hyphenate(text) {
  return text.replace(/\B([A-Z])/g, "-$1").toLowerCase();
}

function isString(value) {
  return typeof value == "string";
}

function isArray(value) {
  return toString.call(value) === "[object Array]";
}

function isNotNull(value) {
  return value != null;
}

function isNotEmpty(value) {
  // 1. 排除 null/undefined
  if (value == null) return false;
  // 2. 排除空字符串
  if (typeof value === "string" && value.trim() === "") return false;
  // 3. 排除空数组
  if (Array.isArray(value) && value.length === 0) return false;
  // 4. 排除空对象
  if (typeof value === "object" && Object.keys(value).length === 0) return false;
  // 其他情况视为非空
  return true;
}

// 千分位
function comma(number) {
  if (number) {
    let values = (number + "").split(".");
    values[0] = values[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return values.join(".");
  } else {
    return number;
  }
}

function limitScale(number, scale) {
  let text = String(number);
  if (text.includes(".")) {
    return text.substring(0, text.indexOf(".") + 1 + scale);
  }
  return number;
}

export default { copy, isNumber, isObject, isArray, hyphenate, isString, comma, limitScale, isNotNull, isNotEmpty };
