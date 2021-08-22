exports.diff = (a, b) => {
  // 空间换时间的解决方法
  const aMap = a.reduce((map, key) => {
    map[key] = true
    return map
  }, {})

  return b.reduce((diffSet, key) => {
    if (!aMap[key]) {
      diffSet.push(key)
    }

    return diffSet
  }, [])
}

exports.joinKeyVal = (obj, joiner = '@') => {
  return Object.entries(obj).reduce((joinContent, [key, val]) => {
    joinContent += `${key}${joiner}${val} `
    return joinContent
  }, '')
} 