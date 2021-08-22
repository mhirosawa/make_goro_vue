<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <div id="app-5">
      <input v-model="keyword">
      <button v-on:click="callMakeGoro"></button>
    </div>
    <ul>

      <li v-for="result in results" v-bind:key="result.id">
        {{ result.text }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      msg: "OK",
      keyword: "test",
      results: [
        { id:1, text: "res1" },
        { id:2, text: "res2" },
        { id:3, text: "res3" }
      ]
    }
  },
  methods: {
    callMakeGoro: function () {
      this.keyword = this.keyword + " hohoho";
      this.results[0].text = this.keyword;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
