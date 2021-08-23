<template>
  <div class="hello">
    <div id="app-5">
      <input v-model="keyword" />
      <button v-on:click="callMakeGoro">語呂作成</button>
    </div>
    <div>
      <div v-for="result in results" v-bind:key="result.id">
        {{ result.text }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "OK",
      keyword: "test",
      results: [
        { id: 1, text: "res1" },
        { id: 2, text: "res2" },
        { id: 3, text: "res3" },
      ],
    };
  },
  methods: {
    callMakeGoro: async function () {
      const url = "/make_goro?type=json&keyword=" + this.keyword;
      const headers = {};
      const resMakeGoro = {
        response: undefined,
        json_body: undefined,
      };
      try {
        resMakeGoro.response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: null,
        });
      } catch (e) {
        // エラー処理
        console.log("Error:" + e.message);
        return "NG";
      }

      if (resMakeGoro.response.ok) {
        //resServicein.json_body = await resMakeGoro.response.json();
        //let text = await resMakeGoro.response.text();
        //console.log("text = " + text);
        //this.results[0].text = text;
        let jsonObj = await resMakeGoro.response.json();
        console.log("jsonObj : " + JSON.stringify(jsonObj));
        this.results = [];
        for (let i = 0; i < jsonObj.candidates.length; i++) {
          console.log("[" + i + "] : " + jsonObj.candidates[i]);
          this.results.push({ id: i, text: jsonObj.candidates[i] });
        }
      }

      //this.keyword = this.keyword + " hohoho";
      //this.results[0].text = this.keyword;
    },
  }, // end of callMakeGoro
};
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
