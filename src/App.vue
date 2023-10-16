<script setup>
import { ref, computed, watch } from 'vue'
import JsonInput from './components/JsonInput.vue'
import { jsonToHtml } from './utils/formatJson'
import { useWebWorkerFn } from '@vueuse/core'

const jsonLoaded = ref(null)
let chunks = []

const { workerFn, workerStatus } = useWebWorkerFn(
  (chunk) => {
    let htmlString = chunk
      .replace(/{/g, '<div class="json-object">{<br>')
      .replace(/}/g, '<br>}</div>')
      .replace(/\[/g, '<div class="json-array">[')
      .replace(/]/g, ']</div>')
      .replace(/,/g, ',<br>')
      .replace(/:/g, ': ')
      .replace(/\n/g, '<br>')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

    const keyValueRegex = /"([^"]+)": ("[^"]*"|\d+|true|false|null)/g;
    htmlString = htmlString.replace(keyValueRegex, (match, key, value) => {
      return `<span class="json-key">"${key}"</span>: <span class="json-value">${value}</span>`;
    });

    return htmlString;
  }
)

const running = computed(() => workerStatus.value === 'RUNNING')
const success = computed(() => workerStatus.value === 'SUCCESS')
const error = computed(() => workerStatus.value === 'ERROR' || workerStatus.value === 'TIMEOUT_EXPIRED')

const handleJson = async (stringJson, size) => {
  await createChunks(stringJson, size)
}

const createChunks = async (stringJson, jsonSize) => {
  const size = 2048
  const chunksSize = Math.ceil(jsonSize / size);

  if (jsonSize <= size) {
    jsonLoaded.value = jsonToHtml(stringJson)
    return;
  }

  const range = [...Array(chunksSize).keys()];

  for (const i of range) {
    const start = i * size;
    const end = start + size;

    const formatedChunk = await workerFn(stringJson.slice(start, end))

    chunks = [...chunks, formatedChunk];
  }
}

watch(success, async (newVal) => {
  if (!newVal) return;

  jsonLoaded.value = chunks.slice(0, 20)
})
</script>

<template>
  <main>
    <div class="wrapper">
      <template v-if="running">
        <h1>Loading...</h1>
      </template>
      <template v-else-if="error">
        <h1>Error</h1>
        <p>There was an error loading the JSON file. Please try again.</p>
        <button @click="jsonLoaded = null">Reset</button>
      </template>
      <template v-else-if="!!jsonLoaded">
        <button @click="jsonLoaded = null">Reset</button>
        <div class="json-wrapper" v-html="jsonLoaded"></div>
      </template>
      <template v-else>
        <h1>JSON Tree Viewer</h1>
        <p>Simple JSON Viewer that runs completely on-client. No data exchange</p>
        <json-input :handle="handleJson" />
      </template>
    </div>
  </main>
</template>

<style scoped>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .wrapper > h1 {
    font-size: 3rem;
    font-weight: 700;
  }

  .wrapper > p {
    font-size: 1.5rem;
    font-weight: 400;
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

  .json-wrapper {
    max-height: 80vh;
  }
</style>
