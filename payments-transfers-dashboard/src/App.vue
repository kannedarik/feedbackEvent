<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
/* eslint-disable import/no-extraneous-dependencies */
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vuejs-noty/dist/vuejs-noty.css';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import 'vue-good-table/dist/vue-good-table.css';

export default {
  name: 'App',
  mounted() {
    this.$lang.setLang('en');
  },
};
</script>
<style lang="scss">
@import "scss/common/_base.scss";
</style>
