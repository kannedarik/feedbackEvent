<template>
  <div class="main-body">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="login">
            <div class="row">
              <div class="col-12 logo">
                <a title="Rupeek" class="text-capitalize"><span>{{ $lang.messages.sangraha }}</span></a>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <b-form @submit="onSubmit" class="form">
                  <h3>{{ $lang.messages.login_page_title }}</h3>
                  <div class="input-row">
                    <label>{{ $lang.messages.username }} / {{ $lang.messages.phone }}</label>
                    <b-form-input type="text"
                                  v-model="form.username"
                                  :state="!$v.form.username.$invalid"
                                  autofocus
                                  class="input">
                    </b-form-input>
                  </div>
                  <div class="input-row">
                    <label>{{ $lang.messages.password }}</label>
                    <b-form-input type="password"
                                  v-model="form.password"
                                  :state="!$v.form.password.$invalid"
                                  class="input">
                    </b-form-input>
                  </div>
                  <b-button type="submit"
                            :disabled="$v.form.$invalid"
                            class="button">
                    {{ $lang.messages.login }}
                  </b-button>
                  <div class="clear"></div>
                </b-form>
              </div>
            </div>
          </div>
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
      roles: [],
    };
  },
  mixins: [
    validationMixin,
  ],
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
        await this.login({ username, password, token: true })
          .then((response) => {
            if (response.status === 200) {
              // this.roles = response.data.user.roles;
              // const checkRoles = this.roles.filter(role => (role.name === 'admin' || role.name === 'opsadmin'));
              // if (checkRoles.length >= 1 && (checkRoles[0].name === 'admin')) {
              //   this.$router.push('/');
              // } else {
              this.$router.push('/vanattribution');
              // }
            }
            return true;
          })
          .catch((err) => {
            this.$noty.error(err.response ? (err.response.data.UserMsg || err.response.data) : err);
          });
      } catch (err) {
        this.$noty.error(err.response ? (err.response.data.UserMsg || err.response.data) : err);
      }
    },
  },
};
</script>

<style scoped>
.main-body {
  padding-top: 85px;
}

.login {
  width: 320px;
  margin: 0 auto;
  margin-top: 0;
}

.login .logo {
  width: 100%;
  padding: 0;
  text-align: center;
  font-size: 25px;
  text-transform: uppercase;
}

.login .logo span {
  font-weight: 700;
}

.login .logo a {
  color: #2b2b2b;
}

.login .logo a:hover {
  color: #2b2b2b;
}

.login h3 {
  padding-bottom: 15px;
  font-size: 14px;
}

.login p {
  padding-bottom: 15px;
  line-height: 21px;
}

.login .form {
  border:1px solid #2b2b2b;
  background: #fff;
  padding: 20px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  -ms-border-radius: 3px;
  border-radius: 3px;
  display: block;
}

.login .input-row {
  padding-top: 15px;
  position: relative;
  z-index: 1;
}

.login .input-row label {
  padding-bottom: 5px;
  display: block;
  font-size: 14px;
  -webkit-transition: 0.2s;
  -moz-transition: 0.2s;
  -ms-transition: 0.2s;
  transition: 0.2s;
}

.login .input-row.active label {
  top: 5px;
  font-size: 12px;
  color: #FB5632;
}

.login .input-row .input {
  border: 1px solid #ebebeb !important;
  background: #fff;
  width: 100%;
  height: 40px;
  float: none;
  margin-bottom: 15px;
  font-size: 16px;
  color: #2b2b2b;
  border-radius: 2px;
  -webkit-transition: 0.2s;
  -moz-transition: 0.2s;
  -ms-transition: 0.2s;
  transition: 0.2s;
}

.login .input-row .input:focus {
  border-bottom-color: #FB5632;
}

.login .button {
  background: #FB5632;
  border: none;
  width: 100%;
  height: 40px;
  float: none;
  margin: 15px 0 0 0;
  padding: 0;
  font-size: 14px;
  color: #fff;
  line-height: 40px;
  text-transform: uppercase;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  -ms-border-radius: 3px;
  border-radius: 3px;
  -webkit-transition: 0.2s;
  -moz-transition: 0.2s;
  -ms-transition: 0.2s;
  transition: 0.2s;
}

.login .button:hover {
  background: #FB5632;
}
</style>
