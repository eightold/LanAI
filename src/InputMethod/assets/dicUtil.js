import { dict } from './dic.js'

let SimpleInputMethod = {
    dict: {}
}

SimpleInputMethod.initDict = function() {
    this.dict.py2hz = dict;
    this.dict.py2hz2 = {};
    this.dict.py2hz2['i'] = 'i'; // i比较特殊，没有符合的汉字，所以特殊处理

    for (let key in this.dict.py2hz) {
        let ch = key[0];
        if (!this.dict.py2hz2[ch]) {
            this.dict.py2hz2[ch] = this.dict.py2hz[key];
        }
    }
};

SimpleInputMethod.getSingleHanzi = function(pinyin){
    return this.dict.py2hz2[pinyin] || this.dict.py2hz[pinyin] || '';
}

SimpleInputMethod.getHanzi = function(pinyin) {
    let result = this.getSingleHanzi(pinyin);
    if (result) return [result.split(''), pinyin];

    let temp = '';
    let start = Math.min(pinyin.length, 6);

    for (let i = start; i >= 1; i--) {
        let str = pinyin.substr(0, i);
        let rs = this.getSingleHanzi(str);
        if (rs) return [rs.split(''), str];
    }

    return [[], '']; // 理论上一般不会出现这种情况
};

// Forward Maximum Matching: segment pinyin string into valid syllables
SimpleInputMethod.segmentPinyin = function(pinyin) {
  var segments = [];
  var pos = 0;
  var len = pinyin.length;
  while (pos < len) {
    var maxSegLen = Math.min(6, len - pos);
    var found = false;
    for (var segLen = maxSegLen; segLen >= 1; segLen--) {
      var sub = pinyin.substr(pos, segLen);
      if (this.dict.py2hz[sub]) {
        segments.push(sub);
        pos += segLen;
        found = true;
        break;
      }
    }
    if (!found) {
      return [];
    }
  }
  return segments;
};

// Generate multi-character word candidates from pinyin
SimpleInputMethod.getCombinedWords = function(pinyin) {
  var segments = this.segmentPinyin(pinyin);
  if (segments.length < 2) {
    return [];
  }
  var result = [];
  var word = '';
  for (var i = 0; i < segments.length; i++) {
    var chars = this.getSingleHanzi(segments[i]);
    if (!chars) {
      return [];
    }
    word += chars[0];
  }
  if (word) {
    result.push(word);
  }
  return result;
};

SimpleInputMethod.initDict();

export { SimpleInputMethod } //换成export default SimpleInputMethod;不能用