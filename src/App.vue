<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: white;
}
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.2);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  border-radius: 4px;
}
</style>
