<template>
  <div class="app-wrapper">
    <Header :links="links" :roles="user.roles"></Header>
    <div class="d-flex">
      <LeftNavigation :items="links" :roles="user.roles"></LeftNavigation>
      <main class="full-width-block">
        <div class="content-container full-width-block">
          <router-view></router-view>
        </div>
      </main>
    </div>
    <Loader/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Header from '@/components/Header/Header';
import LeftNavigation from '@/components/Navigation/LeftNavigation';
import Loader from '@/components/Loader/Loader';
import EventBus from '../../event-bus';
import constants from '../../constants';

export default {
  name: 'Home',
  components: {
    Header,
    LeftNavigation,
    Loader,
  },
  computed: {
    ...mapGetters({
      user: 'auth/loggedInUser',
    }),
  },
  data() {
    return {
      links: constants.links,
    };
  },
  mounted() {
    // reload page receiver
    EventBus.$on('reloadpage', () => {
      this.$router.go();
    });
  },
};
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

main {
  overflow-y: auto;
  max-height: calc(100vh - 50px);
  min-height: calc(100vh - 50px);
  padding: 15px;
  background-color: #f3f3f3;
}

.content-container {
  background: #ffffff;
  border-radius: 3px;
  border: 0px;
  border-top: 2px solid #e5e5e5;
  padding: 10px 0;
  position: relative;
  -moz-box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.2);
  -webkit-box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.2);
  box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.2);
}
</style>
