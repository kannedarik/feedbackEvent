<template>
  <div class="content-container full-width-block page-not-found-wrapper">
    <div class="container">
      <div class="text-center mt-5">
        <img src="/img/not-found.jpg" alt="not found image"/>
      </div>
    </div>

    <div class="row mx-0">
      <div class="col-12 p-0 footer-section">
        <div class="container">
          <div class="row mx-0 d-flex align-items-center flex-wrap text-center position-relative">
            <!-- <div class="col-12 col-md-2 d-none d-md-block d-lg-block">
              &#160;
            </div> -->
            <div class="col-12 col-md-4">
              <h2 class="text-capitalize mb-1">404 error</h2>
              <span class="d-block">Don't panic, and make sure</span>
              <span class="d-block mb-1">to watch your oxygen levels.</span>
            </div>
            <div class="col-12 col-md-4 text-center back-to-section">
              <router-link :to="{ path: '/' }">
                <span class="text-capitalize">Return to Safety</span>
              </router-link>
            </div>
            <!-- <div class="col-12 col-md-2 d-none d-md-block d-lg-block">
              &#160;
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
};
</script>

<style scoped>
.page-not-found-wrapper {
  height: 100vh;
  background: #000000;
  color: #ffffff;
}

.footer-section {
  position: absolute;
  bottom: 50px;
}

.footer-section a {
  display: inline-block;
  border: 1px solid white;
  padding: 10px 30px;
  border-radius: 2px;
  color: #ffffff;
  text-decoration: none;
}

.footer-section a:hover {
  background: #ffffff;
  color: #000000;
}

.back-to-section {
  position: absolute;
  right: 0;
  bottom: 0;
}

@media (max-width: 575.99px) {
  .back-to-section {
    position: relative;
    margin-top: 10px;
  }
}
</style>
