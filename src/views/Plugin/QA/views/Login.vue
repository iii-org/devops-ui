<template>
  <el-row class="login-container" type="flex" align="bottom" justify="end">
    <el-col :md="{span:10}" class="sm:ml-20 sm:mr-20 lg:ml-auto md:mr-20 mb50">
      <h1 class="text-5xl text-white font-black text-center mb-3">DevOps 研發品質入口</h1>
      <h3 class="subTitle">CI / CD 持續整合、持續佈署 自動化工具整合平台</h3>
      <el-col class="bg-gray-100 bg-opacity-40 p-8 rounded-xl ">
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
                 label-position="left"
        >
          <div class="title-container">
            <h3 class="font-black text-2xl m-0 p-0">登入管理平台</h3>
          </div>
          <el-col class="bg-gray-400 bg-transparent-30 mt-5 mb-5 rounded-xl p-5">
            <el-form-item prop="username">
              <span class="svg-container">
                <svg-icon icon-class="user" />
              </span>
              <el-input
                ref="username"
                v-model="loginForm.username"
                placeholder="Username"
                name="username"
                type="text"
                tabindex="1"
                auto-complete="on"
              />
            </el-form-item>

            <el-form-item prop="password">
              <span class="svg-container">
                <svg-icon icon-class="password" />
              </span>
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="Password"
                name="password"
                tabindex="2"
                auto-complete="on"
                show-password
                @keyup.enter.native="handleLogin"
              />
              <!--              <span class="show-pwd" @click="showPwd">-->
              <!--                <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />-->
              <!--              </span>-->
            </el-form-item>
          </el-col>
          <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;"
                     @click.native.prevent="handleLogin"
          >Login
          </el-button>
        </el-form>
      </el-col>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Login',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 8) {
        callback(new Error('The password can not be less than 8 characters'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur' }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    ...mapGetters(['userRole']),
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            // console.log('success login')

            this.loading = false
          }).then(async () => {
            await this.$store.dispatch('user/getInfo')
            // console.log('redirect:', this.redirect)
            this.$router.push({ path: this.redirect || '/' })
            this.$router.go(0)
            // resolve()
          }).catch(e => {
            // console.log(e)
            if (e.message === 'Request failed with status code 401') {
              // console.log(e)
            }
          }).finally(() => {
            this.loading = false
          })
        } else {
          // console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

//@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
//  .login-container .el-input input {
//    color: $cursor;
//  }
//}

/* reset element-ui css */
.login-container {
  min-height: 100%;
  width: 100%;
  //background-image: url('~@/assets/login-bg.png');
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
  overflow: hidden;

  .mb50{
    margin-bottom: 50px;
  }
  .title {
    color: $light_gray;
    margin: 0 auto 20px auto;
    text-align: center;
    font-weight: bold;
  }

  .subTitle {
    color: yellow;
    margin: 0 auto 20px auto;
    text-align: center;
    font-weight: bold;
  }

  .login-position {
    margin-right: 5vh;
    margin-bottom: 5vh;
  }

  //@screen()

  //.login-content {
  //  background-color: rgba(255, 255, 255, 0.4);
  //  border: none;
  //}

  > > > .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      border: 0;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 5px 12px 15px;
      //color: $light_gray;
      height: 47px;
      //caret-color: $cursor;

      //&:-webkit-autofill {
      //  box-shadow: 0 0 0 1000px $bg inset !important;
      //  //-webkit-text-fill-color: $cursor !important;
      //}
    }
  }

  .el-form-item {
    //border: 1px solid rgba(255, 255, 255, 0.2);
    //background: rgba(0, 0, 0, 0.4);
    //border-radius: 5px;
    //color: #454545;
  }
}

//$bg:#2d3a4b;
$dark_gray: #889aa4;
//$light_gray:#eee;

.login-container {
  .login-form {
    position: relative;
    bottom: 0;
    right: 0;
    margin: 0 20px;
    //width: 520px;
    //max-width: 100%;
    //padding: 160px 35px 0;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: #000000;
    vertical-align: middle;
    width: 40px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      text-align: left;
      color: #000000;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 30px;
    top: 15px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
