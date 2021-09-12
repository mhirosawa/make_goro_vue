<template>
  <div class="hello">
    <div id="app-5">
      <input v-model="keyword" />
      <button v-on:click="callMakeGoro">語呂作成</button>
    </div>
    <div class="result_list">
      <div class="result_item" v-for="result in results" v-bind:key="result.id">
        {{ result.text }}
      </div>
    </div>
    <img class="center-none" v-show="loading_disp" src="@/assets/img/loading.gif" />
  </div>
</template>

<script>
export default {
  name: "GoroMain",
  data() {
    return {
      msg: "OK",
      keyword: "test",
      results: [
        { id: 1, text: "res1" },
        { id: 2, text: "res2" },
        { id: 3, text: "res3" },
      ],
      loading_disp: false,
    };
  },
  methods: {
    callMakeGoro: async function () {
      //const url =
      //  process.env.VUE_APP_API_BASE_URL + "/make_goro?type=json&keyword=" + this.keyword;
      const url = "/make_goro?type=json&keyword=" + this.keyword;
      const headers = {};
      const resMakeGoro = {
        response: undefined,
        json_body: undefined,
      };

      this.loading_disp = true;

      try {
        resMakeGoro.response = await fetch(url, {
          method: "GET",
          headers: headers,
          body: null,
        });
      } catch (e) {
        // エラー処理
        console.log("Error:" + e.message);
        return "NG";
      }

      this.loading_disp = false;

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
.result_list {
  text-align: left;
  margin-left: 20px;
  margin-right: 20px;
}
.result_item {
  border-bottom: 1px solid #8888;
  padding-top: 2px;
  padding-bottom: 2px;
}
.center-none {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
}
</style>
