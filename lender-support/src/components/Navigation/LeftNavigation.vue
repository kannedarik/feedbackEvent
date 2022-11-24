<template>
  <aside class="left-nav-wrapper text-center d-none d-md-none d-lg-block">
    <ul>
      <li v-for="item in accessItems" :key="item.key">
        <router-link :to="{ name: item.link}"
          class="transition block d-flex flex-align-center">
           <div class="icon-wrapper ml-3">
            <font-awesome-icon :icon="item.icon"></font-awesome-icon>
          </div>
          <div class="text-capitalize text-left">
            {{ $lang.messages[item.key] }}
          </div>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
import intersection from 'lodash/intersection';
import filter from 'lodash/filter';

export default {
  name: 'LeftNavigation',
  props: {
    items: {
      type: Array,
      required: true,
    },
    roles: {
      type: Array,
      required: true,
    },
  },
  computed: {
    accessItems() {
      return filter(this.items, item => (intersection(item.roles, this.roles).length > 0));
    },
  },
};
</script>

<style scoped>
.left-nav-wrapper {
  max-width: 160px;
  width: 160px;
  max-height: calc(100vh - 50px);
  min-height: calc(100vh - 50px);
  height: calc(100vh - 50px);
  position: relative;
  background-color: #1D2839;
  overflow-y: auto;
}
.icon-wrapper {
  min-width: 25px;
  text-align: left;
}

.left-nav-wrapper > ul > li {
  float: left;
  width: 100%;
  position: relative;
}

.left-nav-wrapper > ul > li > a {
  width: 100%;
  line-height: 19px;
  color: #BEC9D8;
  font-size: 13px;
  padding: 15px 0;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
}

.left-nav-wrapper > ul > li > a svg {
  font-size: 15px;
}

.left-nav-wrapper > ul > li > a span {
  width: 100%;
  display: block;
}

.left-nav-wrapper > ul > li > a:hover, .left-nav-wrapper > ul > li > a.router-link-active {
  background: #09162A;
  color: #ffffff;
}

.left-nav-wrapper > ul > li > a:hover::before,
.left-nav-wrapper ul li > a.router-link-active::before {
  content: '';
  position: absolute;
  height: 100%;
  width: 1px;
  left:0;
  top:0;
  border-left: 4px solid #ff6300;
}
</style>
