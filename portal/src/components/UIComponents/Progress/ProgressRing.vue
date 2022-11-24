<template>
  <div class="rings ring-style">
    <svg :height="diameter" :width="diameter">
      <circle
        :cx="outerCircleRadius"
        :cy="outerCircleRadius"
        :r="normalizedRadius"
        stroke="#ebebeb"
        :stroke-width="strokeWidth"
        fill="transparent"
      />
      <circle
        stroke="#02d714"
        :stroke-dasharray="circumference + ' ' + circumference"
        :style="{ strokeDashoffset: strokeDashoffset }"
        :stroke-width="strokeWidth"
        fill="transparent"
        :r="normalizedRadius"
        :cx="outerCircleRadius"
        :cy="outerCircleRadius"
      />
      <circle
        fill="#ff8b00"
        :r="innerCircleRadius"
        :cx="outerCircleRadius"
        :cy="outerCircleRadius"
      ></circle>
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        fill="white"
        dy=".3em"
        font-size="9px"
        font-weight="800"
      >
        {{ value + "/" + max }}
      </text>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'ProgressRing',
  props: {
    outerCircleRadius: {
      type: Number,
      required: true,
    },
    strokeWidth: {
      type: Number,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    normalizedRadius() {
      return this.outerCircleRadius - 3;
    },
    circumference() {
      return this.normalizedRadius * 2 * Math.PI;
    },
    progress() {
      return (this.value / this.max) * 100;
    },
    strokeDashoffset() {
      return this.circumference - (this.progress / 100) * this.circumference;
    },
    diameter() {
      return this.outerCircleRadius * 2;
    },
    innerCircleRadius() {
      return this.normalizedRadius / 1.6;
    },
  },
};
</script>

<style scoped>
circle:nth-child(2) {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}
.ring-style {
  margin-right: 9px;
}
</style>
