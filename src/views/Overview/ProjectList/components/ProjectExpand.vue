<template>
  <section v-if="children.length > 0" style="margin-left: 50px;">
    <h4 class="ml-5 my-1">{{ $t('general.ChildrenProject') }}</h4>
    <el-tree
      :data="children"
      :data-key="children.id"
      :indent="50"
      icon-class="el-icon-arrow-right"
    >
      <div
        slot-scope="{ node, data }"
        class="flex justify-start items-center"
      >
        <!-- star -->
        <template>
          <div class="mr-3">
            <em
              v-if="data.starred"
              class="el-icon-star-on text-yellow-500 text-2xl cursor-pointer"
              @click.stop="$emit('setStar', data.id, false)"
            />
            <em
              v-else
              class="el-icon-star-off text-gray-400 text-xl cursor-pointer"
              @click.stop="$emit('setStar', data.id, true)"
            />
          </div>
        </template>
        <!-- web link -->
        <template>
          <div class="flex mr-3">
            <!-- gitlab button -->
            <el-popover
              v-if="data.git_url"
              :disabled="data.disabled || data.is_lock"
              class="mr-1"
              placement="top"
              width="400"
              trigger="hover"
              :open-delay="300"
              :close-delay="50"
            >
              <p
                :id="`copy-${data.id}`"
                class="text-center"
              >
                <span class="text-title">{{ data.git_url }}</span>
              </p>
              <div class="flex justify-center">
                <el-button
                  class="mr-2"
                  icon="el-icon-copy-document"
                  circle
                  size="mini"
                  @click.stop="copyUrl(`copy-${data.id}`)"
                />
                <a
                  :href="data.git_url"
                  target="_blank"
                >
                  <el-button
                    circle
                    size="mini"
                  >
                    <em class="ri-external-link-line" />
                  </el-button>
                </a>
              </div>
              <el-link
                slot="reference"
                :underline="false"
                :disabled="data.disabled || data.is_lock"
                style="font-size: 14px; padding: 0 2px;"
              >
                <svg-icon icon-class="gitlab" />
              </el-link>
            </el-popover>
            <!-- redmine button -->
            <el-link
              v-if="data.redmine_url"
              target="_blank"
              class="mr-1"
              style="font-size: 14px; padding: 0 2px;"
              :underline="false"
              :disabled="data.disabled || data.is_lock"
              :href="data.redmine_url"
            >
              <svg-icon icon-class="redmine" />
            </el-link>
            <!-- harbor button -->
            <el-link
              v-if="data.harbor_url"
              target="_blank"
              style="font-size: 14px; padding: 0 2px;"
              :underline="false"
              :disabled="data.disabled || data.is_lock"
              :href="data.harbor_url"
            >
              <svg-icon icon-class="harbor" />
            </el-link>
          </div>
          <div class="mr-3">
            <el-link
              v-if="userRole !== 'QA'"
              :class="data.disabled || data.is_lock ? '' : 'linkTextColor'"
              :underline="false"
              :disabled="data.disabled || data.is_lock"
              @click.stop="$emit('handleClick', data)"
            >
              {{ data.display }}
            </el-link>
            <template v-else>
              {{ data.display }}
            </template>
            <br>
          </div>
        </template>
        <!-- issue status -->
        <template>
          <el-tag
            type="success"
            size="mini"
            class="el-tag--circle mr-3"
            effect="dark"
          >
            進行中
          </el-tag>
        </template>
        <!-- project manager -->
        <template>
          <el-tag
            size="mini"
            class="el-tag--circle mr-3"
            effect="dark"
          >
            <em class="el-icon-user-solid" />
            <span>{{ data.owner_name }}</span>
          </el-tag>
        </template>
        <!-- actions -->
        <template>
          <el-tooltip
            v-if="userRole !== 'QA' && data.is_lock !== true"
            placement="bottom"
            :content="$t('general.Edit')"
          >
            <em
              class="ri-file-edit-line finished operate-button"
              @click.stop="$emit('handleEdit', data)"
            />
          </el-tooltip>
          <el-tooltip
            v-if="data.is_lock !== true"
            placement="bottom"
            :content="$t('general.Delete')"
          >
            <em
              :disabled="permission(data)"
              class="ri-delete-bin-2-line danger operate-button"
              @click.stop="$emit('handleDelete', data)"
            />
          </el-tooltip>
          <el-tooltip
            v-if="data.is_lock === true"
            placement="bottom"
            :content="$t('general.ForceDelete')"
          >
            <em
              :disabled="permission(data)"
              class="ri-delete-bin-2-line danger operate-button"
              @click.stop="$emit('handleDelete', data, true)"
            />
          </el-tooltip>
          <el-tooltip
            v-if="data.is_lock === true"
            placement="bottom"
            :content="$t('general.Fix')"
          >
            <em class="ri-refresh-line active operate-button" @click.stop="$emit('handleFix', data.id)" />
          </el-tooltip>
          <el-tooltip
            v-if="data.is_lock !== true"
            placement="bottom"
            :content="!data.disabled ? $t('general.Disable') : $t('general.Enable')"
          >
            <em
              :disabled="permission(data)"
              :class="data.disabled
                ? 'ri-play-circle-line finished operate-button'
                : 'ri-pause-circle-line danger operate-button'"
              @click.stop="$emit('handleToggle', data)"
            />
          </el-tooltip>
        </template>
      </div>
    </el-tree>
  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ProjectExpand',
  props: {
    children: {
      type: Array,
      default: () => {}
    }
  },
  computed: {
    ...mapGetters([
      'userId',
      'userRole'
    ])
  },
  methods: {
    ...mapActions('projects', ['setSelectedProject']),
    permission(row) {
      const { creator_id, owner_id } = row
      if (this.userRole === 'Administrator') return false
      if (this.userRole === 'QA') {
        if (creator_id !== this.userId) return true
      } else {
        if (owner_id !== this.userId) return true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
}

::v-deep .el-tree-node {
  margin-bottom: 3px;
}
</style>
