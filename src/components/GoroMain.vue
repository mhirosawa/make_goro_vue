<template>
  <div class="hello">
    <div id="all-title">英単語語呂作成マシーン</div>
    <div class="input-all">
      <input class="input" v-model="keyword" v-on:keyup.enter="callMakeGoro" />
      <select class="search_num" v-model="selectedSearchNum">
        <option disabled value="">候補数</option>
        <option
          v-for="searchNum in optionSearchNum"
          v-bind:value="searchNum.num"
          v-bind:key="searchNum.id"
        >
          {{ searchNum.num }}
        </option>
      </select>
      <button class="input_submti" v-on:click="callMakeGoro">語呂作成</button>
    </div>
    <div class="pronounce">{{ pronounce }}</div>
    <div class="jCharsCandidates">
      <div>文字候補：</div>
      <div
        class="jCharsCandidate_item"
        v-for="jCharsCandidate in jCharsCandidates"
        v-bind:key="jCharsCandidate.id"
      >
        {{ jCharsCandidate.text }}
      </div>
    </div>
    <div class="result_list">
      <div>語呂候補：</div>
      <div class="result_item" v-for="result in results" v-bind:key="result.id">
        {{ result.text }}
      </div>
    </div>
    <div id="about"><a href="https://github.com/mhirosawa/make_goro_vue">About</a></div>
    <img class="center-none" v-show="loading_disp" src="@/assets/img/loading.svg" />
  </div>
</template>

<script>
export default {
  name: "GoroMain",
  data() {
    return {
      msg: "OK",
      keyword: "test",
      pronounce: "",
      results: [],
      loading_disp: false,
      selectedSearchNum: 20,
      optionSearchNum: [
        { id: 1, num: 20 },
        { id: 2, num: 30 },
        { id: 3, num: 50 },
      ],
    };
  },
  methods: {
    callMakeGoro: async function () {
      const url =
        process.env.VUE_APP_API_BASE_URL +
        "/make_goro?type=json&keyword=" +
        this.keyword +
        "&limit=" +
        this.selectedSearchNum;
      //const url = "/make_goro?type=json&keyword=" + this.keyword;
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

        // 発音
        this.pronounce = jsonObj.pronounce;

        // 文字候補
        this.jCharsCandidates = [];
        for (let i = 0; i < jsonObj.jCharsCandidates.length; i++) {
          console.log("[" + i + "] : " + jsonObj.jCharsCandidates[i]);
          this.jCharsCandidates.push({ id: i, text: jsonObj.jCharsCandidates[i] });
        }

        // 語呂候補
        this.results = [];
        for (let i = 0; i < jsonObj.candidates.length; i++) {
          console.log("[" + i + "] : " + jsonObj.candidates[i]);
          this.results.push({ id: i, text: jsonObj.candidates[i].goro });
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
.hello {
  background-color: #d6cdc5;
  padding: 20px;
}
#all-title {
  margin-bottom: 20px;
  font-size: 200%;
  color: white;
}
.input-all {
  padding-bottom: 20px;
}
.input {
  margin-right: 10px;
  padding: 10px;
  border-radius: 10px;
}
.search_num {
  margin-right: 10px;
  padding: 10px;
  border-radius: 10px;
}
.input_submti {
  padding: 10px;
  border-radius: 10px;
}
.pronounce {
  text-align: left;
  padding: 10px;
  border-radius: 10px;
  background-color: white;
}
.jCharsCandidates {
  text-align: left;
  margin-top: 20px;
  padding: 10px;
  background-color: white;
  border-radius: 10px;
}
.jCharsCandidate_item {
  margin-left: 20px;
}
.result_list {
  text-align: left;
  margin-top: 20px;
  padding: 10px;
  border-radius: 10px;
  background-color: white;
}
.result_item {
  border-bottom: 1px solid #8888;
  padding-top: 2px;
  padding-bottom: 2px;
  margin-left: 20px;
}
#about {
  margin-top: 20px;
}
.center-none {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
}
</style>
