<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb class="breadcrumb-container" />
    <div class="flex right-menu items-center">
      <AbnormalChecker />
      <VersionChecker class="ml-2" />
      <lang-select class="right-menu-item hover-effect ml-1" />
      <el-dropdown
        class="right-menu-item hover-effect mr-5"
        trigger="click"
      >
        <div>
          {{ userName }}
          <em class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu
          slot="dropdown"
          class="user-dropdown"
        >
          <router-link to="/">
            <el-dropdown-item>
              <router-link
                :to="'/profile/'"
                style="color: #409EFF"
              >
                <span>{{ $t('navbar.profile') }}</span>
              </router-link>
            </el-dropdown-item>
            <el-dropdown-item>
              <router-link
                :to="'/SystemVersion/'"
                style="color: #409EFF"
              >
                <span>{{ $t('navbar.versions') }}</span>
              </router-link>
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item
            id="systemLogoutBtn"
            divided
            @click.native="logout"
          >
            <span style="display:block;">{{ $t('navbar.logOut') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import LangSelect from '@/components/LangSelect'
import VersionChecker from '@/components/VersionChecker'
import AbnormalChecker from '@/components/AbnormalChecker'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    LangSelect,
    VersionChecker,
    AbnormalChecker
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'userName'])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push('/login?redirect=/')
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }
  }
}
</style>
