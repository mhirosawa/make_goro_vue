<template>
  <GoroMain msg="Welcome to Your Vue.js App" />
</template>

<script>
import GoroMain from "./components/GoroMain.vue";

export default {
  name: "App",
  components: {
    GoroMain,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
