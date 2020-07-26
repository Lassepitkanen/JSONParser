let len, setIndex, value;

function parseJSON(data) {
  setIndex = void 0;
  value = void 0;

  const str = data.toString().replace(/\s/g, '');
  len = str.length;
  getValue(str, 0);
  return value;
}

function parseArray(str) {
  let result = [];
  for (let i = 1; i < len; ++i) {
    getValue(str, i);
    if (value !== void 0) {
      result.push(value);
      value = void 0;
    }
    if (setIndex !== void 0) {
      i = setIndex;
      setIndex = void 0;
    }
  }
  return result;
}

function parseObject(str) {
  let result = {};
  let key = void 0;
  for (let i = 1; i < len; ++i) {
    getValue(str, i);
    if (value !== void 0) {
      if (key === void 0) {
        key = value;
      }
      else {
        result[key] = value;
        key = void 0;
      }
      value = void 0;
    }
    if (setIndex !== void 0) {
      i = setIndex;
      setIndex = void 0;
    }
  }
  return result;
}

function getValue(str, i) {
  let endIndex = -1;
  switch (str.charCodeAt(i)) {
    case 91: // [
      endIndex = findContainerEnd(str, i, 91, 93);
      if (endIndex !== -1) {
        value = parseArray(str.slice(i, endIndex));
        setIndex = endIndex;
      }
      break;
    case 110: // n
      value = null;
      setIndex = i + 3
      break;
    case 116: // t
      value = true;
      setIndex = i + 3
      break;
    case 102: // f
      value = false;
      setIndex = i + 4;
      break;
    case 34: // "
      endIndex = str.indexOf('"', i + 1);
      if (endIndex !== -1) {
        value = str.slice(i + 1, endIndex);
        setIndex = endIndex + 1;

        let strIndex = value.indexOf('\\');
        while (strIndex !== -1) {
          const foundStr = value.slice(strIndex, strIndex + 6);
          if (foundStr.length > 5) {
            const codedStr = String.fromCharCode(parseInt(foundStr.slice(2, 6), 16));
            value = value.substring(0, strIndex) + codedStr + value.substring(strIndex + 6);
            strIndex = value.indexOf('\\', strIndex + 1);
          }
          else {
            value = value.slice(1, value.length + 1);
            break;
          }
        }
      }
      break;
    case 123: // {
      endIndex = findContainerEnd(str, i, 123, 125);
      value = parseObject(str.slice(i, endIndex));
      setIndex = endIndex;
      break;
    case 45: case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: //number
      endIndex = getEndIndex(str, i + 1);
      value = Number(str.slice(i, endIndex));
      setIndex = endIndex;
      break;
    default:
      break;
  }
}

function findContainerEnd(str, i, startCode, endCode) {
  let subArrays = 0;
  let char;
  for (let index = i; index < len; ++index) {
    char = str.charCodeAt(index)
    if (char === endCode) { // ]
      --subArrays;
      if (subArrays === 0) {
        return index;
      }
    }
    else if (char === startCode) {// [
      ++subArrays;
    }
  }
  return len;
}

function getEndIndex(str, i) {
  let endIndex = len;
  let char;
  for (let index = i; index < len; ++index) {
    char = str.charCodeAt(index);
    if (char === 44 || char === 125 || char === 93) { // , } ]
      endIndex = index;
      break;
    }
  }
  return endIndex;
}
