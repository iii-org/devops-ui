<template>
  <el-card style="width: 80%; background-color: #dbdbdb;">
    <!-- <el-row class="flex">
      <el-col
        :span="9"
        class="mr-4"
      >
        <el-card
          shadow="hover"
          style="height: 400px;"
        >
          <div class="mb-4 font-bold">
            {{ $t('Release.releaseVersionName') }}/{{ $t('Git.Branch') }}/{{ $t('PodsList.Image') }}</div>
          <el-form
            ref="form"
            :model="commitForm"
          >
            <el-form-item :label="$t('Release.releaseVersionName')">
              <el-select
                v-model="commitForm.mainVersion"
                :placeholder="$t('Release.selectMainVersion')"
                filterable
              >
                <el-option
                  v-for="item in releaseVersionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Git.Branch')">
              <el-select
                v-if="branches.length > 0"
                v-model="commitForm.branch"
                filterable
                @change="handleSelectedRepoName(commitForm.branch)"
              >
                <el-option
                  v-for="item in branches"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
              <div v-else>{{ $t('general.Nothing') }}</div>
            </el-form-item>
            <el-form-item :label="$t('Git.Commit')">
              <div v-if="commitId">
                <svg-icon icon-class="ion-git-commit-outline" />
                {{ commitId }}
              </div>
              <div v-else>{{ $t('general.Nothing') }}</div>
            </el-form-item>
            <el-form-item>
              {{ $t('PodsList.Image') }}:
              <span
                v-if="showHarborTag"
                class="custom-black"
                style="line-height: 40px;"
              >
                <svg-icon v-if="!checkHarborLoading" icon-class="ion-git-commit-outline" />
                {{ checkHarborLoading ? $t('Updating') : repoArtifactName }}
              </span>
              <span v-else>
                <span class="text-danger mr-3">
                  <em class="el-icon-warning" />
                  <span>{{ $t('Issue.NoImage') }}</span>
                </span>
                <div style="margin-top: 35px;">
                  <el-popconfirm
                    :confirm-button-text="$t('Issue.DetermineContinue')"
                    :cancel-button-text="$t('general.Cancel')"
                    :title="$t('Issue.NoImageWarning')"
                    icon="el-icon-info"
                    icon-color="red"
                    @confirm="handleConfirm"
                  >
                    <el-button
                      slot="reference"
                      type="success"
                    >{{ $t('Issue.NextStep') }}</el-button>
                  </el-popconfirm>
                  <el-button
                    type="danger"
                    @click="handleCancel"
                  >{{ $t('general.Cancel') }}</el-button>
                </div>
              </span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="15">
        <el-card
          shadow="hover"
          style="height: 400px;"
        >
          <div class="mb-4 font-bold">{{ $t('Release.releaseNote') }}</div>
          <el-form>
            <el-form-item>
              <el-input
                v-model="commitForm.note"
                class="w-full"
                type="textarea"
                :rows="11"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                v-if="isConfirmPackageVersion || showHarborTag"
                v-loading.fullscreen.lock="fullscreenLoading"
                type="success"
                @click="release"
              >
                <span class="el-icon-goods" />
                {{ $t('Release.startRelease') }}
              </el-button>
              <el-button
                v-else
                v-loading.fullscreen.lock="fullscreenLoading"
                type="info"
                disabled
              >
                <span class="el-icon-goods" />
                {{ $t('Release.startRelease') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <issue-list-dialog ref="issueDialog" />
    </el-row> -->
    <div>程式/映像檔版本</div>
    <div class="text-right">
      <el-button
        :disabled="isLoading || hasOpenIssue"
        @click="nextStep"
      >
        下一步
        <i class="el-icon-right" />
      </el-button>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'ImageVersion',
  methods: {
    nextStep() {
      this.$emit('onNextStep')
    }
  }
}
</script>
