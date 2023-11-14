/**
 * 删除某个元素
 *
 * @param {Array} arr
 * @param {String} key
 * @param {String} value
 */
function remove(arr, key, value) {
  let idx = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] == value) {
      idx = i;
      break;
    }
  }

  if (idx != -1) {
    arr.splice(idx, 1);
  }
}

/**
 * 根据指定属性值获取某个元素
 *
 * @param {Array} arr
 * @param {String} key
 * @param {String} val
 */
function get(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] == val) return arr[i];
  }
  return {};
}

/**
 * 是否为数组
 *
 * @param {Object} obj
 * @returns
 */
function isArray(obj) {
  return Array.isArray(obj);
}

/**
 * 数组去重
 *
 * @param {*} arr
 * @param {*} field
 * @returns
 */
function distinct(arr, field) {
  var obj = {};
  arr = arr.reduce(function (item, next) {
    obj[next[field]] ? "" : (obj[next[field]] = true && item.push(next));
    return item;
  }, []);
  return arr;
}

/**
 * 两个数组的交集
 *
 * @param {*} a
 * @param {*} b
 * @returns
 */
function intersection(a, b) {
  return a.filter((v) => b.includes(v));
}

/**
 * 数组去重
 *
 * @param {Array} arr
 * @returns
 */
const unique = (arr) => {
  const res = new Map();
  return arr.filter((arr) => !res.has(arr) && res.set(arr, 1));
};

export default { remove, get, isArray, distinct, intersection, unique };
