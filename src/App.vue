<script setup>
import { ref, computed } from 'vue'
import JsonInput from './components/JsonInput.vue'
import { useWebWorkerFn, useVirtualList } from '@vueuse/core'

const jsonLoaded = ref('')

const { workerFn, workerStatus } = useWebWorkerFn((json) => {
  return JSON.stringify(JSON.parse(json), null, 2)
})

const running = computed(() => workerStatus.value === 'RUNNING')
const success = computed(() => workerStatus.value === 'SUCCESS')
const error = computed(
  () => workerStatus.value === 'ERROR' || workerStatus.value === 'TIMEOUT_EXPIRED'
)

const jsonSplitted = computed(() => {
  if (!jsonLoaded.value) return null
  return jsonLoaded.value.split('\n')
})

const handleJson = async (stringJson) => {
  jsonLoaded.value = await workerFn(stringJson)
}

const { list, containerProps, wrapperProps } = useVirtualList(
  jsonSplitted,
  {
    itemHeight: 12,
  },
)
</script>

<template>
  <main>
    <div class="wrapper" :class="{ 'render-json': success }">
      <template v-if="running">
        <h1>Loading...</h1>
      </template>
      <template v-else-if="success">
        <div v-bind="containerProps" style="height: 100%; width: 100%; white-space: pre;">
          <h1>JSON READED {{ jsonSplitted.length }}</h1>
          <ul v-bind="wrapperProps" style="list-style-type: none;">
            <li v-for="item in list" :key="item.index" style="height: 12px; font-size: 12px;">
              [{{ item.index }}] {{ item.data }}
            </li>
          </ul>
        </div>
      </template>
      <template v-else>
        <h1>JSON Tree Viewer</h1>
        <p>Simple JSON Viewer that runs completely on-client. No data exchange</p>
        <json-input :handle="handleJson" />
        <p class="error" v-if="error">There was an error loading the JSON file. Please try again.</p>
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

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  padding: 0 2rem;
}

.render-json {
  height: 100%;
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
