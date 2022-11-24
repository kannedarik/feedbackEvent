<template>
  <div>
    <Container>
      <Dashboard />
    </Container>
  </div>
</template>

<script>
import Dashboard from '@/components/Dashboard/Dashboard.vue';
import Container from '@/components/CommonComponents/Container.vue';

export default {
  name: 'Home',
  components: {
    Container,
    Dashboard,
  },
};
</script>
