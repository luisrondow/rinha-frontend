<script setup>
const { handle } = defineProps({
  handle: {
    type: Function,
    required: true
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.name.slice(-5).toLowerCase() !== '.json') {
    alert('Please upload a valid JSON file.')
    return
  }

  const reader = new FileReader()

  reader.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100)
      console.log(`Loading JSON file: ${percent}%`)
    }
  })

  reader.addEventListener('load', (e) => {
    try {
      console.log('Loaded JSON file with size: ', e.total)
      handle(e.target.result)
    } catch (error) {
      console.error(error)
      alert('Error parsing JSON. Please ensure the file contains valid JSON.')
    }
  })

  reader.readAsText(file, 'UTF-8')
}
</script>

<template>
  <div class="file-input-wrapper">
    <input type="file" id="fileInput" @change="handleFileChange" hidden />
    <label for="fileInput" ref="fileLabel">Load JSON</label>
  </div>
</template>

<style scoped>
.file-input-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
  background-color: #f4f4f4;
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;

  padding: 4px 8px;
  font-size: 14px;
}

label {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  cursor: pointer;
}
</style>
