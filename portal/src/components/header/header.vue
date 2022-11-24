<template>
  <header class="block bg-white position-sticky py-2"
    v-if="userObj && !isHealthCheckPath">
    <div class="container d-flex items-center">
      <div class="rupeek-logo-wrapper">
        <router-link to="/">
          <img src="@/assets/rupeek_logo.svg" class="mobile-logo block img-fluid"/>
        </router-link>
      </div>
      <nav class="user-info-dropdown right-header block flex items-center justify-end">
        <div class="quick-links position-relative flex items-center cursor-pointer"
          @click.stop="showQuickLinksToggle">
          <b-badge variant="success" class="new-top-up">New</b-badge>
          <span class="text-xs md:text-sm">
            {{ quickLinkDispaly }}
          </span>
          <span class="dropdown ml-2">
            <img :class="{hide: !showQuickLinks}"
              src="@/assets/arrows/down_arrow.svg" alt="show more">
          </span>
          <transition name="nav-menu">
            <div class="position-absolute nav-menu-header" v-if="showQuickLinks">
              <DropDown :hamburgerMenuItems="quickLinks" :selectedLink="quickLinkSelected"/>
            </div>
          </transition>
        </div>
        <b-dropdown id="ddown-right" right text="Right align" variant="link" no-caret>
          <template slot="button-content">
            <div class="user-profile cursor-pointer d-flex items-center">
              <div class="profile-pic mr-2"
                :style="{ 'background-image': 'url(' + picid + ')' }">
              </div>
              <img src="@/assets/arrows/down_arrow.svg" />
            </div>
          </template>
          <b-dropdown-item>
            <div class="text-capitalize d-flex flex-align-center">
              <div class="profile-pic" :style="{ 'background-image': 'url(' + picid + ')' }"></div>
              <div class="user-details text-left">
                <span class="block margin-10px"> {{ userObj && userObj.firstname }}</span>
                <span class="block margin-10px font-small bold-font">
                  Phone : {{ userObj && userObj.phone }}
                </span>
              </div>
            </div>
          </b-dropdown-item>
          <b-dropdown-item>
            <span
              @click="signOut()"
              class="cursor-pointer bold-font display-inline-block float-right"
              >Logout</span
            >
          </b-dropdown-item>
        </b-dropdown>
      </nav>
    </div>
  </header>
</template>

<script>
/* eslint-disable no-underscore-dangle */
import _ from 'lodash';
import moment from 'moment';
import { mapActions, mapGetters } from 'vuex';
import intersection from 'lodash/intersection';
import DropDown from '@/components/CommonComponents/DropDownMenu/index.vue';
import picid from '@/assets/default-thumb.jpeg';

export default {
  name: 'Header',
  props: {},
  computed: {
    ...mapGetters({
      userObj: 'auth/loggedInUser',
      quickLinkSelected: 'quickLinks/quickLinkSelected',
      quickLinks: 'quickLinks/quickLinks',
      quickLinkDispaly: 'quickLinks/quickLinkDispaly',
      quickLinksInfo: 'quickLinks/quickLinksInfo',
    }),
  },
  data() {
    return {
      picid,
      isHealthCheckPath: false,
      quickLinksList: [{
        name: 'All Loans',
        id: 'all',
        onClickHandler: () => {
          this.selectQuickLink('all', 'Manage Loans');
        },
      }],
      showQuickLinks: false,
    };
  },
  components: {
    DropDown,
  },
  watch: {
    quickLinksInfo(value) {
      const transformedQuickLinks = value.links.map((quicklink) => {
        const data = {
          name: quicklink.name,
          id: quicklink.type,
          onClickHandler:
            this.selectQuickLink.bind(this, quicklink.params.repayment_type, quicklink.name),
        };
        return data;
      });
      this.upDateQuickLinks([...this.quickLinksList, ...transformedQuickLinks]);
    },
  },
  methods: {
    ...mapActions({
      logout: 'auth/logout',
      resetSelectedLoans: 'loans/resetSelectedLoans',
      setSelectedLoans: 'loans/setSelectedLoans',
      setQuickLinkSelected: 'quickLinks/setQuickLinkSelected',
      upDateQuickLinks: 'quickLinks/upDateQuickLinks',
      setQuickLinkDispaly: 'quickLinks/setQuickLinkDispaly',
      fetchQuickLinks: 'quickLinks/fetchQuickLinks',
    }),
    moment(date) {
      return moment(date);
    },
    access(itemRoles, userRoles) {
      return intersection(itemRoles, userRoles).length > 0;
    },
    signOut() {
      this.logout()
        .then((response) => {
          if (response.status === 200) this.$router.push('/login');
        })
        .catch((error) => {
          this.$noty.error(error.response.data.UserMsg);
        });
    },
    showQuickLinksToggle() {
      this.showQuickLinks = !this.showQuickLinks;
    },
    selectQuickLink(filter, dispalyText) {
      this.resetSelectedLoans();
      this.setQuickLinkSelected(filter);
      this.setQuickLinkDispaly(dispalyText);
      this.setSelectedLoans();
      if (this.$route.name !== 'Home') {
        this.$router.push('/dashboard');
      }
    },
  },
  mounted() {
    this.isHealthCheckPath = window.location.pathname === '/app/health' || window.location.pathname === '/app/health/';
    // fetch quick links details
    if (_.isEmpty(this.quickLinksInfo)) {
      this.fetchQuickLinks();
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/common/_mixins.scss";
.new-top-up {
  position: absolute;
  top: -3px;
  left: -20px;
}
header {
  top: 0;
  left: 0;
  right: 0;
  z-index: 111;
  @include box-shadow(0px 3px 10px 0, rgba(0, 0, 0, 0.08));
}

.margin-10px {
  margin: 0 10px;
}

.rupeek-logo-wrapper {
  max-width: 120px;
}

.right-header {
  max-width: calc(100% - 100px);
}

.right-header > ul > li {
  display: inline-block;
}

.right-header > ul > li > a {
  float: left;
  padding: 10px 20px;
}

.right-header > ul > li a:hover {
  background-color: #ddd;
}

.right-header > ul > li:last-child > a {
  padding: 10px 10px;
}

.profile-pic {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-image: url("/static/images/profile-image/sandeep.jpeg");
  background-size: contain;
}

.header-last-dropdown.dropdown .dropdown-menu {
  left: initial;
  right: 0;
  margin: 0;
  padding: 0;
  border: none;
}

.dropdown-menu > li > a {
  padding: 10px 20px;
}

.header-last-dropdown .dropdown-menu {
  min-width: 230px;
}

.header-last-dropdown .dropdown-menu li:first-child {
  padding: 15px 15px;
}

.header-last-dropdown .dropdown-menu li:last-child {
  border-top: 1px solid #ddd;
  background-color: #f4f3f3;
}

.header-last-dropdown .dropdown-menu li:last-child a {
  padding: 3px 15px;
  float: right;
  margin: 10px 10px;
  border: 1px solid #ddd;
  border-radius: 2px;
  background-color: #ddd;
  font-weight: 700;
}

.header-last-dropdown.open {
  background-color: #fff;
}

.header-last-dropdown.open:hover {
  background-color: #fff;
}

.user-details {
  max-width: calc(100% - 30px);
  width: 100%;
}

a.header-last-dropdown:hover {
  color: #000;
}

.user-profile {
  width: max-content;
  margin-left: auto;
}

.dropdown-menu.open {
  display: block;
}
.quick-links {
  background: #FAFAFA;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  border-radius: 4px;
  padding: 8px 16px;
  text-transform: capitalize;
}
</style>
