<template>
  <div class="main-body d-flex block">
    <div class="m-auto d-flex white-background">
      <div class="flex-1 login-background d-xs-none d-flex">
        <h1 class="m-auto white-color bold-font text-center">
          Rupeek
          <br />Lender Support
        </h1>
      </div>
      <div class="flex-1">
        <div class="login block">
          <b-form @submit="onSubmit" class="form block">
            <div class="logo-wrapper text-center">
              <img src="../../assets/img/logo.svg" class="img-responsive" alt />
            </div>
            <h3
              class="text-center margin-bottom-15px bold-font"
            >{{ $lang.messages.login_page_title }}</h3>
            <div class="form-group">
              <label class="small-font">
                {{ $lang.messages.username }} / {{ $lang.messages.phone }}
              </label>
              <b-form-input
                type="text"
                v-model="form.username"
                :state="!$v.form.username.$invalid"
                autofocus
                class
              ></b-form-input>
            </div>
            <div class="form-group">
              <label class="small-font">{{ $lang.messages.password }}</label>
              <b-form-input
                type="password"
                v-model="form.password"
                :state="!$v.form.password.$invalid"
                class="input"
              ></b-form-input>
            </div>
            <div class="text-center">
              <b-button
                type="submit"
                :disabled="$v.form.$invalid"
                class="button block bold-font text-uppercase"
              >{{ $lang.messages.login }}</b-button>
            </div>
          </b-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, minLength } from 'vuelidate/lib/validators';
import { mapActions } from 'vuex';

export default {
  name: 'Login',
  data() {
    return {
      form: {},
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      username: {
        required,
        minLength: minLength(3),
      },
      password: {
        required,
        minLength: minLength(3),
      },
    },
  },
  methods: {
    ...mapActions({
      login: 'auth/login',
    }),
    async onSubmit(evt) {
      evt.preventDefault();
      try {
        const { username, password } = this.form;
        await this.login({ username, password, token: true });
        this.$router.push('/');
      } catch (err) {
        this.$noty.error(err.response.data.message || err.response.data);
      }
    },
  },
};
</script>

<style scoped>
.logo-wrapper img {
  max-width: 150px;
}

.main-body {
  max-height: 100vh;
  min-height: 100vh;
  background-color: #f1f1f1;
}

.main-body .flex-1 {
  min-width: 400px;
}

.login-background {
  background-image: url('../../assets/img/login.jpg');
  background-size: cover;
  background-color: #f26422;
  background-blend-mode: multiply;
}

.form {
  padding: 35px 35px;
}

.form h3 {
  font-size: 1rem;
}
.main-body .margin-auto {
  border-radius: 5px;
  box-shadow: 1px 5px 10px rgba(0, 0, 0, 0.3);
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
}

body {
  background-color: #f1f1f1;
}
@media (max-width: 768px) {
  .main-body .flex-1 {
    min-width: 300px;
  }
}
</style>
