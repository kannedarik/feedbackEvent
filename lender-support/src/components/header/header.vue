<template>
  <div class="navbar-fixed header shadow">
    <nav>
      <div class="nav-wrapper d-flex justify-content-between px-3">
        <b-link :to="{ path: '/' }">
          <img src="../../assets/img/logo.svg" class="logo"/>
        </b-link>
        <div class="d-flex align-items-center">
          <!-- Dropdown for page navigation links section -->
          <b-dropdown variant="link"
          class="d-xs-block d-sm-block d-md-block d-lg-none d-xl-none"
          right size="sm" no-caret id="navigation-links-dropdown">
            <template slot="button-content">
              <font-awesome-icon icon="bars"></font-awesome-icon>
            </template>
            <b-dropdown-item v-for="link in accessLinks"
             :to="{ name: link.key }" :key="link.key"
             class="text-center text-capitalize">
             {{ $lang.messages[link.key] }}
            </b-dropdown-item>
          </b-dropdown>

          <!-- Dropdown for logout section -->
          <b-dropdown variant="link" class="" size="sm" no-caret id="header-logout-dropdown">
            <template slot="button-content">
              <font-awesome-icon icon="user-circle" class="mt-1"></font-awesome-icon>
            </template>
            <b-dropdown-item @click.prevent="logOut"
              class="text-center text-capitalize">
              {{ $lang.messages.logout }}
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import intersection from 'lodash/intersection';
import filter from 'lodash/filter';
import { mapActions } from 'vuex';

export default {
  name: 'Header',
  props: {
    links: {
      type: Array,
      required: true,
    },
    roles: {
      type: Array,
      required: true,
    },
  },
  computed: {
    accessLinks() {
      return filter(this.links, link => intersection(link.roles, this.roles).length > 0);
    },
  },
  methods: {
    ...mapActions({
      logout: 'auth/logout',
    }),
    logOut() {
      this.logout();
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.header,
.header nav,
.header nav .nav-wrapper i,
.header nav a.sidenav-trigger,
.header nav a.sidenav-trigger i {
  height: 50px;
  line-height: 50px;
}

.header nav {
  background: #ffffff;
}

.logo {
  max-width: 90px;
  margin-left: 10px;
  display: inline-block;
}

#navigation-links-dropdown {
  z-index: 1116;
}

#navigation-links-dropdown svg, #header-logout-dropdown svg {
  font-size: 1.45rem;
  color: #ff6300;
}

#navigation-links-dropdown .dropdown-menu .dropdown-item,
#header-logout-dropdown .dropdown-menu .dropdown-item {
  line-height: 20px;
}

.dropdown-item:hover, .dropdown-item.active {
  background-color: #ff6300;
  color: #ffffff;
}

.dropdown-item.active {
  pointer-events: none;
}

div#header-logout-dropdown button {
  display: none;
}
</style>
