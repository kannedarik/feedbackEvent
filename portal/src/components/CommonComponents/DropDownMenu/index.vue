<template>
    <ul class="menu-list">
        <li
        v-for="menuItem in hamburgerMenuItems"
        :key="menuItem.id"
        :class="['menu-list-item', menuItem.id === selectedLink && 'active']"
        @click="menuItem.onClickHandler"
        >{{menuItem.name}}</li>
    </ul>
</template>
<script>
export default {
  props: {
    selectedLink: String,
    hamburgerMenuItems: Array,
  },
};
</script>
<style lang="scss">
.nav-menu-header {
  ul.menu-list {
    top: 30px;
    right: auto;
    left: -30px;
  }
}
ul.menu-list {
    position: absolute;
    right: 1rem;
    top: 100%;
    z-index: 100;
    background-color: rgba(255, 255, 255, 1) !important;
    border-radius: 0.5rem !important;
    box-shadow: 3px 3px 15px rgba(0, 0, 0, 0.25);
    // backdrop-filter: blur(10px);
    transform-origin: 90% -10%;
    font-weight: 400;
    // color: white;
    letter-spacing: 1px;
    word-spacing: 3px;
    font-weight: 600;
    font-size: 16px;
    color: #1E2D4B;
    text-transform: capitalize;
    li.menu-list-item {
        padding: 0.85rem 2rem;
        white-space: nowrap;

        &.active {
          color: #EA5518;
          background: #FDEEE8;
        }

        & + li.menu-list-item {
        border-top: 1px solid rgba(0, 0, 0, 0.12);
        }
    }

  li.menu-list-item {
    padding: 0.5rem 1rem;
    & + li.menu-list-item {
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }
    &:hover {
      border-radius: 0.5rem !important;
      background-color: rgba(0, 0, 0, 0.2) !important;
      cursor: pointer;
    }
  }
}
</style>
