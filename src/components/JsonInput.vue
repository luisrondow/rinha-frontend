<script setup>
const { handle } = defineProps({
  handle: {
    type: Function,
    required: true
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Check if the file has a .json extension
  if (file.name.slice(-5).toLowerCase() !== '.json') {
    alert('Please upload a valid JSON file.');
    return;
  }

  const reader = new FileReader();
  reader.readAsText(file, 'UTF-8');
  reader.onload = (e) => {
    try {
      console.log('Loaded JSON file with size: ', e.total);
      handle(e.target.result, e.total);
    } catch (error) {
      console.error(error);
      alert('Error parsing JSON. Please ensure the file contains valid JSON.');
    }
  };
}
</script>

<template>
    <div class="file-input-wrapper">
        <input type="file" id="fileInput" @change="handleFileChange" hidden>
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