<template>
  <div>
    <Container>
      <div class="d-flex flex-col h-100vh
        justify-center text-center inter-font-family">
        <div class="body block p-4">
          <h1 class="text-9xl font-bold text-bg">404</h1>
          <h2 class="text-4xl md:text-6xl font-medium py-8 text-bg">
            oops! Page not found
          </h2>
          <h3>We can’t find the page you’re looking for.</h3>
        </div>
        <div class="w-10/12 mx-auto md:w-2/4">
          <router-link to='/' class="btn-rupeek rounded-pill
            py-3 px-5 d-flex justify-center">
            Back to home
          </router-link>
        </div>
      </div>
    </Container>
  </div>
</template>

<script>
import Container from '@/components/CommonComponents/Container.vue';

export default {
  name: 'NotFound',
  components: {
    Container,
  },
};
</script>
<style scoped lang='scss'>
.text-bg {
  background: linear-gradient(90deg, #EA5518 -4.17%,
  #E63918 21.6%, #B01280 52.15%, #1E65AF 104.17%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
