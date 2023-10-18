<script setup>
import { ref, computed, watch } from 'vue'
import JsonInput from './components/JsonInput.vue'
import { useVirtualList } from '@vueuse/core'

const MAX_INDEX = 2_500_000

const jsonLoaded = ref('')
const startIndex = ref(0)
const counter = ref(0)
const hasMore = ref(true)

const loading = ref(false)
const error = ref(false)

const listRef = ref(null)
const listStartReached = ref(false)
const endOfListReached = ref(false)

const jsonSplitted = computed(() => {
  if (!jsonLoaded.value) return null

  const jsonSplittedByLine = jsonLoaded.value.split('\n')

  const start = counter.value > 0 ? MAX_INDEX * counter.value - 1000 : 0

  if (jsonSplittedByLine.length > MAX_INDEX * (counter.value + 1)) {
    hasMore.value = true
    startIndex.value = start

    return jsonSplittedByLine.slice(start, MAX_INDEX * (counter.value + 1))
  } else {
    hasMore.value = false
    return jsonSplittedByLine.slice(start)
  }
})

const setIsLoading = (value) => {
  loading.value = value
}

const handleJson = async (stringJson) => {
  try {
    jsonLoaded.value = JSON.stringify(JSON.parse(stringJson), null, 2)
  } catch (err) {
    console.error(err)
    error.value = true
  }
}

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(jsonSplitted, {
  itemHeight: 12
})

const handleScroll = () => {
  const targetRect = listRef.value.getBoundingClientRect()

  listStartReached.value = targetRect.top >= -4
  endOfListReached.value =
    targetRect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
}

watch(containerProps.ref, (value) => {
  if (value) {
    value.addEventListener('scroll', handleScroll)
  }
})

watch(listStartReached, async (value) => {
  if (value && counter.value > 0) {
    if (counter.value === 1) hasMore.value = false

    counter.value = counter.value - 1
  }
})

watch(endOfListReached, async (value) => {
  if (value && hasMore.value) {
    counter.value = counter.value + 1
  }
})

watch(jsonSplitted, () => {
  if (counter.value > 0) {
    console.log('scrolling to', MAX_INDEX * counter.value - 1000)
    scrollTo(999)
  }
})
</script>

<template>
  <main>
    <div class="wrapper">
      <template v-if="!!jsonSplitted?.length">
        <div
          v-bind="containerProps"
          style="height: 100%; width: 100%; white-space: pre; padding-bottom: 2rem"
        >
          <ul ref="listRef" v-bind="wrapperProps" style="list-style-type: none">
            <li v-for="item in list" :key="item.index" style="height: 12px; font-size: 12px">
              {{ startIndex + item.index }} | {{ item.data }}
            </li>
          </ul>
        </div>
      </template>
      <template v-else-if="loading">
        <h1>Loading...</h1>
      </template>
      <template v-else>
        <h1>JSON Tree Viewer</h1>
        <p>Simple JSON Viewer that runs completely on-client. No data exchange</p>
        <json-input :handle="handleJson" :set-is-loading="setIsLoading" />
        <p class="error" v-if="error">
          There was an error loading the JSON file. Please try again.
        </p>
      </template>
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
}

.wrapper {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  padding: 0 2rem;
}

.wrapper > h1 {
  font-size: 3rem;
  font-weight: 700;
}

.wrapper > p {
  font-size: 1.5rem;
  font-weight: 400;
}

.wrapper > p.error {
  color: red;
  font-size: 0.8rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #f4f4f4;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}
</style>
