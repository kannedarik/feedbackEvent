<template>
  <div>
    {{timerCountdown}}
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'TimerCountdown',
  data() {
    return {
      timerCountdown: '',
    };
  },
  props: {
    dueDate: String,
    schemeType: String,
  },
  methods: {
    timerCount() {
      const dateFormat = 'DD/MM/YYYY HH:mm:ss';
      const currentTime = moment().format(dateFormat);
      const dueDateTime = moment(this.dueDate).utc().format(dateFormat);
      const diffTime = moment(dueDateTime, dateFormat).diff(moment(currentTime, dateFormat));
      const duration = moment.duration(diffTime);
      const fullTime = Math.floor(duration.asHours()) + moment.utc(diffTime).format(':mm:ss');
      this.timerCountdown = this.schemeType === 'jumping' ? `Interest Jumps in ${fullTime} hrs`
        : `Interest Overdue in ${fullTime} hrs`;
    },
  },
  mounted() {
    this.timerCount();
    this.interval = setInterval(() => {
      this.timerCount();
    }, 1000);
  },
};
</script>
