<template>
  <div class="video__container">
    <video ref="videoPlayer" class="video-js"></video>
    <PlayButton
      v-if="isVideoPaused"
      :isVideoBanner="false"
      @PlayVideo="player.play()"
    />
  </div>
</template>

<script>
import 'videojs-youtube';
import 'video.js/dist/video-js.css';
import videojs from 'video.js';
import PlayButton from './PlayButton.vue';

export default {
  name: 'Player',
  props: {
    options: null,
    showHeader: null,
  },
  components: {
    PlayButton,
  },
  data() {
    return {
      player: null,
      // show center play button only when video is paused
      isVideoPaused: false,
      timer: null,
      // time duration to disappear when user touches the screen on touchable devices.
      timerDuration: 5000,
    };
  },
  mounted() {
    this.player = videojs(
      this.$refs.videoPlayer,
      this.options,
    );
    // events triggers when video is played
    this.player.on('play', () => {
      this.isVideoPaused = false;
      // Give some delay for header to disappear if video is playing
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (this.player && !this.player.paused()) {
          this.$emit('playing');
        }
      }, this.timerDuration);
    });
    // events fired when video is paused
    this.player.on('pause', () => {
      this.isVideoPaused = true;
      // trigger paused event to show header message
      this.$emit('paused');
    });
    // touchstart events for touchable devices
    this.player.on('touchstart', () => {
      clearTimeout(this.timer);
      if (this.showHeader) {
        this.$emit('inactive');
      } else {
        this.$emit('active');
        this.timer = setTimeout(() => {
          if (this.player && !this.player.paused()) {
            this.$emit('inactive');
          }
        }, this.timerDuration);
      }
    });
  },
  beforeUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  },
};
</script>

<style lang="scss">
.video__container {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  background: #484848;
  .video-js,
  .vjs-poster {
    width: 100%;
    height: 100%;
    background: #484848;
  }
  .video-js [aria-hidden=true] {
    visibility: visible;
  }
  .video-js .vjs-picture-in-picture-control,
  .video-js .vjs-fullscreen-control,
  .video-js .vjs-big-play-button {
    display: none;
  }
  .video-js.vjs-layout-small .vjs-current-time,
  .video-js .vjs-current-time,
  .video-js.vjs-layout-small .vjs-duration {
    display: flex !important;
  }
  .video-js .vjs-play-progress {
    background-color: #fe9411;
  }
  .video-js.vjs-layout-small .vjs-duration {
    order: 4;
  }
  .video-js .vjs-volume-panel {
    order: 5;
  }
  .video-js .vjs-control-bar {
    background-color: transparent;
  }
}
</style>
