<template>
  <div>
    <img :src="!isVideoBanner ? newPlayButton : playButton"
    class="playButton" @click="$emit('PlayVideo')" />
  </div>
</template>

<script>
import newPlayButton from '@/assets/new_play_button.svg';
import playButton from '@/assets/play_button.svg';

export default {
  name: 'PlayButton',
  data() {
    return {
      newPlayButton,
      playButton,
    };
  },
  props: {
    isVideoBanner: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style lang = "scss" scoped>
.playButton {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  cursor: pointer;
}
</style>
