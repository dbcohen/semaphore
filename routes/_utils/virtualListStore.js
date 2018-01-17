import { Store } from 'svelte/store.js'

class VirtualListStore extends Store {
}

const virtualListStore = new VirtualListStore({
  items: [],
  itemHeights: {},
})

virtualListStore.compute('visibleItems',
    ['items', 'scrollTop', 'itemHeights', 'offsetHeight'],
    (items, scrollTop, itemHeights, offsetHeight) => {
  let renderBuffer = 1.5 * offsetHeight
  let visibleItems = []
  let totalOffset = 0
  let len = items.length
  let i = -1
  while (++i < len) {
    let { props, key } = items[i]
    let height = itemHeights[key] || 0
    let currentOffset = totalOffset
    totalOffset += height
    let isBelowViewport = (currentOffset < scrollTop)
    if (isBelowViewport) {
      if (scrollTop - renderBuffer > currentOffset) {
        continue // below the area we want to render
      }
    } else {
      if (currentOffset > (scrollTop + offsetHeight + renderBuffer)) {
        break // above the area we want to render
      }
    }
    visibleItems.push({
      offset: currentOffset,
      props: props,
      key: key,
      index: i,
      height: height
    })
  }
  return visibleItems
})

virtualListStore.compute('distanceFromBottom',
    ['scrollHeight', 'scrollTop', 'offsetHeight'],
    (scrollHeight, scrollTop, offsetHeight) => {
  if (typeof scrollHeight === 'undefined' ||
      typeof scrollTop === 'undefined' ||
      typeof offsetHeight === 'undefined') {
    return -1
  }
  return scrollHeight - scrollTop - offsetHeight
})

virtualListStore.compute('height', ['items', 'itemHeights'], (items, itemHeights) => {
  let sum = 0
  let i = -1
  let len = items.length
  while (++i < len) {
    sum += itemHeights[items[i].key] || 0
  }
  return sum
})

if (process.browser && process.env.NODE_ENV !== 'production') {
  window.virtualListStore = virtualListStore
}

export {
  virtualListStore
}