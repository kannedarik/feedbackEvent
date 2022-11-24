<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vuejs-noty/dist/vuejs-noty.css';

export default {
  name: 'app',
  mounted() {
    this.$lang.setLang('en');
  },
};
</script>

<style lang='scss'>
  @import 'src/scss/common/_base.scss';
  @import 'src/scss/common/_normalize.scss';
</style>
