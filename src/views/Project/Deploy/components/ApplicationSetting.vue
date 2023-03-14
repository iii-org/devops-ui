<template>
  <div class="app-container m-5">
    <el-form
      ref="deployForm"
      :model="deployForm"
      :rules="deployFormRules"
      label-width="125px"
    >
      <el-card class="box-card">
        <div slot="header">
          {{ $t('Deploy.ApplicationSetting') }}
        </div>
        <el-form-item
          :label="$t('Deploy.Name')"
          prop="name"
        >
          <el-input
            v-model="deployForm.name"
            :maxlength="30"
            show-word-limit
          />
          <p class="helper">
            * {{ $t('Deploy.NameRule') }}
          </p>
        </el-form-item>
      </el-card>
      <el-card class="box-card mt-5">
        <el-form-item
          :label="$t('Deploy.Location')"
          prop="remote"
        >
          <el-radio-group
            v-model="deployForm.remote"
            size="mini"
            @change="changeRemote"
          >
            <el-radio-button :label="false">
              {{ $t('Deploy.Local') }}
            </el-radio-button>
            <el-radio-button :label="true">
              {{ $t('Deploy.Remote') }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <template v-if="deployForm.remote">
          <el-divider />
          <el-form-item
            :label="$t('Deploy.Namespace')"
            prop="namespace"
          >
            <el-input
              v-model="deployForm.namespace"
              :maxlength="30"
              show-word-limit
            />
            <p class="helper">
              * {{ $t('Deploy.NameRule') }}
            </p>
          </el-form-item>
          <el-form-item
            :label="$t('Deploy.Cluster')"
            prop="cluster_id"
          >
            <el-select
              v-model="deployForm.cluster_id"
              :disabled="clusterList.length <= 0"
              filterable
              @change="changeClusterId"
            >
              <el-option
                v-for="item in clusterList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
                :disabled="item.disabled"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('Deploy.Registry')"
            prop="registry_id"
          >
            <el-select
              v-model="deployForm.registry_id"
              :disabled="registryList.length <= 0"
              filterable
            >
              <el-option
                v-for="item in registryList"
                :key="item.registries_id"
                :label="item.name"
                :value="item.registries_id"
                :disabled="item.disabled"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-card>
      <el-card class="box-card mt-5">
        <el-row>
          <el-col class="mb-3" :xl="6" :lg="8" :md="8" :sm="24" :xs="24">
            <el-form-item
              :label="$t('Project.Project')"
              style="margin-bottom: unset;"
            >
              <el-select
                v-model="projectId"
                filterable
              >
                <el-option
                  v-for="item in projectOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="18" :lg="16" :md="16" :sm="24" :xs="24">
            <el-form-item
              :label="$t('Deploy.RelationProject')"
              style="margin-bottom: unset;"
            >
              <el-col :xl="6" :lg="8" :md="10" :sm="10" :xs="24">
                <el-select
                  v-model="projectRelationIds"
                  filterable
                  multiple
                  collapse-tags
                  :disabled="projectRelationList.length === 0"
                  class="mb-3"
                >
                  <el-option
                    v-for="item in projectRelationList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-col>
              <el-col :xl="18" :lg="16" :md="14" :sm="14" :xs="24">
                <el-button
                  class="mr-3"
                  :disabled="projectRelationIds.length === 0"
                  @click="addContainer"
                >
                  {{ $t('general.Add') + 'Container' }}
                </el-button>
                <span
                  v-if="deployForm.applications.length === 0"
                  style="color: red; font-size: 12px;"
                >
                  <em class="ri-error-warning-fill ri-lg" />
                  {{ $t('Deploy.AtLeastContainer') }}
                </span>
              </el-col>
            </el-form-item>
          </el-col>
        </el-row>
        <template v-if="deployForm.applications.length > 0">
          <el-divider />
          <ElTableDraggable :animate="300">
            <el-table
              :data="deployForm.applications"
              fit
              class="cursor-move"
            >
              <el-table-column
                align="center"
                width="50"
              >
                <em class="ri-menu-line" />
              </el-table-column>
              <el-table-column
                prop="project_name"
                :label="$t('Deploy.SourceProject')"
                align="center"
                width="180"
              />
              <el-table-column :label="$t('Deploy.SourceProject')">
                <el-row slot-scope="{$index}">
                  <el-col :xl="6" :lg="8" :md="12" :sm="24" :xs="24">
                    <el-form-item
                      :prop="`applications.${$index}.image.type`"
                      :label="$t('Deploy.SourceType')"
                      style="display: inline-block;"
                    >
                      <el-select
                        v-model="deployForm.applications[$index].image.type"
                        clearable
                        @change="changeSourceType($index)"
                      >
                        <el-option
                          v-for="item in source_type"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <template v-if="deployForm.applications[$index].image.type === 'harbor'">
                    <el-col :xl="6" :lg="8" :md="12" :sm="24" :xs="24">
                      <el-form-item
                        :prop="`applications.${$index}.release_id`"
                        :label="$t('Deploy.Release')"
                        style="display: inline-block;"
                      >
                        <el-select
                          v-model="deployForm.applications[$index].release_id"
                          @change="getEnvironmentFromRelease($index)"
                        >
                          <el-option
                            v-for="item in deployForm.applications[$index].releaseList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col
                      v-if="deployForm.applications[$index].releaseList"
                      :xl="12" :lg="8" :md="24" :sm="24" :xs="24"
                      class="pt-2 pl-2"
                    >
                      <span v-if="deployForm.applications[$index].releaseList.length === 0" class="helper text-xs">
                        * {{ $t('Deploy.ReleaseHelper') }}
                      </span>
                      <span v-else-if="deployForm.applications[$index].release_id">
                        {{ deployForm.applications[$index].releaseList.find((item) => item.id === deployForm.applications[$index].release_id).value }}
                      </span>
                    </el-col>
                  </template>
                  <template v-if="deployForm.applications[$index].image.type === 'dockerhub'">
                    <el-col :xl="6" :lg="8" :md="12" :sm="24" :xs="24">
                      <el-form-item
                        :prop="`applications.${$index}.image.uri`"
                        :label="$t('Deploy.Path')"
                        style="display: inline-block;"
                      >
                        <el-input v-model="deployForm.applications[$index].image.uri" />
                      </el-form-item>
                    </el-col>
                    <el-col
                      :xl="12" :lg="8" :md="24" :sm="24" :xs="24"
                      class="pt-2 pl-2"
                    >
                      <span v-if="deployForm.applications[$index].image.uri">
                        {{ deployForm.applications[$index].image.uri }}
                      </span>
                    </el-col>
                  </template>
                </el-row>
              </el-table-column>
              <el-table-column
                :label="$t('general.Actions')"
                align="center"
                width="100"
              >
                <template slot-scope="{$index}">
                  <el-link
                    icon="el-icon-delete"
                    class="ml-3"
                    @click="removeContainer($index)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </ElTableDraggable>
        </template>
      </el-card>
      <el-card
        v-if="deployForm.applications.length > 0"
        class="box-card mt-5"
      >
        <div slot="header">
          {{ $t('Deploy.AdvancedApplicationSetting') }}
        </div>
        <el-tabs
          v-model="tabName"
          type="card"
        >
          <el-tab-pane
            v-for="(item,index) in deployForm.applications"
            :key="item.project_id"
            :label="item.project_name"
            :name="item.project_name"
          >
            <el-form-item
              :label="$t('Deploy.Policy')"
              :prop="`applications.${index}.image.policy`"
            >
              <el-radio-group v-model="deployForm.applications[index].image.policy">
                <el-radio label="Always" />
                <el-radio label="Never" />
                <el-radio label="If not present" />
              </el-radio-group>
            </el-form-item>
            <el-row>
              <el-col :xl="8" :lg="8" :md="8" :sm="24" :xs="24">
                <el-form-item
                  :label="$t('Deploy.CPU')"
                  :prop="`applications.${index}.resources.cpu`"
                >
                  <el-input
                    v-model.number="deployForm.applications[index].resources.cpu"
                    :placeholder="$t('Deploy.Default')"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :xl="8" :lg="8" :md="8" :sm="24" :xs="24">
                <el-form-item
                  :label="$t('Deploy.Memory')"
                  :prop="`applications.${index}.resources.memory`"
                >
                  <el-input
                    v-model.number="deployForm.applications[index].resources.memory"
                    :placeholder="$t('Deploy.Default')"
                    clearable
                  >
                    <template slot="append">
                      GB
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :xl="8" :lg="8" :md="8" :sm="24" :xs="24">
                <el-form-item
                  :label="$t('Deploy.Replicas')"
                  :prop="`applications.${index}.resources.replicas`"
                >
                  <el-input
                    v-model.number="deployForm.applications[index].resources.replicas"
                    :placeholder="$t('Deploy.Default')"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item
              :label="$t('Deploy.Domain')"
              :prop="`applications.${index}.network.domain`"
            >
              <el-input
                v-model="deployForm.applications[index].network.domain"
                clearable
              />
            </el-form-item>
            <el-form-item :label="$t('Deploy.Network')">
              <el-link
                type="primary"
                :underline="false"
                @click="addNetwork(index)"
              >
                {{ $t('general.Add')+ $t('Deploy.Network') }}
              </el-link>
            </el-form-item>
            <el-form
              ref="network"
              :model="deployForm"
              :rules="deployFormRules"
              label-width="50px"
            >
              <el-row
                v-for="(item,i) in deployForm.applications[index].network.ports"
                :key="'ports'+i"
              >
                <el-divider v-if="i>0" class="mt-0" />
                <el-col :xl="8" :lg="8" :md="8" :sm="24" :xs="24">
                  <el-form-item :prop="`applications.${index}.network.ports.${i}.port`">
                    <el-input v-model.number="item.port" clearable>
                      <template slot="prepend">
                        Inner
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :xl="8" :lg="8" :md="8" :sm="24" :xs="24">
                  <el-form-item :prop="`applications.${index}.network.ports.${i}.expose_port`">
                    <em slot="label" class="el-icon-right" />
                    <el-input v-model.number="item.expose_port" clearable>
                      <template slot="prepend">
                        Outer
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :xl="8" :lg="8" :md="8" :sm="24" :xs="24">
                  <el-form-item :prop="`applications.${index}.network.ports.${i}.protocol`">
                    <el-radio-group v-model="item.protocol">
                      <el-radio-button
                        v-for="item in protocol"
                        :key="item"
                        :label="item"
                      />
                    </el-radio-group>
                    <el-link
                      v-if="i !== 0"
                      icon="el-icon-delete"
                      class="ml-3"
                      @click="removeNetwork(index,i)"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <template v-if="scList.length > 0">
              <el-form-item :label="$t('Deploy.PluginStoredPath')">
                <el-link
                  type="primary"
                  :underline="false"
                  @click="addPath(index)"
                >
                  {{ $t('Deploy.AddPath') }}
                </el-link>
              </el-form-item>
              <el-form
                ref="volume"
                :model="deployForm"
                :rules="deployFormRules"
                label-width="50px"
              >
                <el-row
                  v-for="(item,i) in deployForm.applications[index].volumes"
                  :key="'volume'+i"
                >
                  <el-divider v-if="i>0" class="mt-0" />
                  <el-col :xl="4" :lg="6" :md="8" :sm="24" :xs="24">
                    <el-form-item>
                      <el-select v-model="item.sc_name">
                        <el-option
                          v-for="item in scList"
                          :key="item.id"
                          :label="item.name"
                          :value="item.name"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xl="20" :lg="18" :md="16" :sm="24" :xs="24">
                    <el-form-item label="path">
                      <el-col :xl="20" :lg="20" :md="20" :sm="20" :xs="20">
                        <el-popover
                          :disabled="!item.device_path"
                          placement="top-start"
                          width="400"
                          trigger="hover"
                          :content="item.device_path"
                        >
                          <el-input
                            slot="reference"
                            v-model="item.device_path"
                            clearable
                          />
                        </el-popover>
                      </el-col>
                      <el-col :xl="1" :lg="1" :md="1" :sm="1" :xs="1">
                        <el-link
                          icon="el-icon-delete"
                          class="ml-3"
                          @click="removePath(index,i)"
                        />
                      </el-col>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </template>
            <el-form-item :label="$t('Deploy.EnvironmentVariable')">
              <el-link
                type="primary"
                :underline="false"
                @click="addEnvironment(index)"
              >
                {{ $t('Deploy.AddVariable') }}
              </el-link>
            </el-form-item>
            <el-form
              ref="environment"
              :model="deployForm"
              :rules="deployFormRules"
              label-width="50px"
            >
              <el-row
                v-for="(item,i) in deployForm.applications[index].environments"
                :key="'environment'+i"
              >
                <el-divider v-if="i>0" class="mt-0" />
                <el-col :xl="4" :lg="6" :md="8" :sm="24" :xs="24">
                  <el-form-item :prop="`applications.${index}.environments.${i}.type`">
                    <el-select v-model="item.type">
                      <el-option
                        v-for="item in environments_type"
                        :key="item"
                        :label="item"
                        :value="item"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xl="6" :lg="8" :md="8" :sm="24" :xs="24">
                  <el-form-item label="key">
                    <el-col :xl="20" :lg="20" :md="20" :sm="20" :xs="20">
                      <el-popover
                        :disabled="!item.key"
                        placement="top-start"
                        width="300"
                        trigger="hover"
                        :content="item.key"
                      >
                        <el-input
                          slot="reference"
                          v-model="item.key"
                          clearable
                        />
                      </el-popover>
                    </el-col>
                  </el-form-item>
                </el-col>
                <el-col :xl="14" :lg="10" :md="8" :sm="24" :xs="24">
                  <el-form-item label="value" :prop="`applications.${index}.environments.${i}.value`">
                    <el-col :xl="20" :lg="20" :md="20" :sm="20" :xs="20">
                      <el-popover
                        :disabled="!item.value"
                        placement="top-start"
                        width="400"
                        trigger="hover"
                        :content="item.value"
                      >
                        <el-input
                          slot="reference"
                          v-model="item.value"
                          clearable
                        />
                      </el-popover>
                    </el-col>
                    <el-col :xl="1" :lg="1" :md="1" :sm="1" :xs="1">
                      <el-link
                        icon="el-icon-delete"
                        class="ml-3"
                        @click="removeEnvironment(index,i)"
                      />
                    </el-col>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </el-form>
    <span class="float-right my-5">
      <el-button
        class="buttonSecondaryReverse"
        @click="handleLeave"
      >
        {{ $t('general.Cancel') }}
      </el-button>
      <el-button
        v-if="applicationId"
        class="buttonPrimary"
        @click="handleConfirm(applicationId)"
      >
        {{ $t('general.Save') }}
      </el-button>
      <el-button
        v-else
        class="buttonPrimary"
        @click="handleConfirm(null)"
      >
        {{ $t('general.Add') }}
      </el-button>
    </span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getDeployedHostsLists,
  getDeployedStorageLists,
  getRegistryHostsLists,
  getReleaseEnvironments,
  getMultiService,
  postMultiService,
  putMultiService,
  isExposePortAvailable
} from '@/api/deploy'
import { getHasSon, getProjectRelation } from '@/api_v2/projects'
import { getReleaseVersion } from '@/api_v2/release'
import project from '@/data/project'
import ElTableDraggable from 'element-ui-el-table-draggable'

const protocol = ['TCP', 'UDP']
const policy = ['Always', 'Never', 'IfNotPresent']
const network_type = [
  // 'ClusterIP',
  'NodePort'
  // 'LoadBalancer'
] // 'ExternalName',
const environments_type = ['configmap', 'secret']
const source_type = [
  { label: 'III DevOps Release', value: 'harbor' },
  { label: 'dockerhub', value: 'dockerhub' }
]

export default {
  name: 'ApplicationSetting',
  components: { ElTableDraggable },
  data() {
    const _this = this
    const keyValidator = (rule, value) => {
      return new Promise((resolve, reject) => {
        const keyCheck = []
        value.forEach((item, idx) => {
          const findKeyCheck = keyCheck.find(key => key.name === item.key)
          if (!findKeyCheck) {
            keyCheck.push({ name: item.key, index: [idx + 1] })
          } else {
            findKeyCheck.index.push(idx + 1)
          }
          if (!item.key || item.key.length <= 0) return reject(this.$t('Deploy.AllNull', [this.$tc('Deploy.Key', 2)]))
          if (!item.type || item.type.length <= 0) return reject(this.$t('Deploy.AllNull', [this.$tc('Deploy.Type', 2)]))
        })
        const checkDuplicate = keyCheck.filter(key => key.index.length > 1)
        if (checkDuplicate.length > 0) return reject(this.$t('Deploy.KeyConflicts', [checkDuplicate.map(key => this.$t('Deploy.KeyPair', [key.name, key.index.join(', ')])).join(', ')]))
        return resolve()
      })
    }
    const domainValidator = (rule, value) => {
      return new Promise((resolve, reject) => {
        const index = rule.field.split('.')[1]
        const network = _this.deployForm.applications[index].network
        if (
          (network.path && (network.path !== '' || network.path.length > 0)) &&
          (!value || value === '' || value.length <= 0)
        ) {
          return reject(this.$t('Deploy.PairCondition', [this.$t('Deploy.Domain'), [this.$t('Deploy.Domain'), this.$t('Deploy.Path')].join(', ')]))
        }
        return resolve()
      })
    }
    const pathValidator = (rule, value) => {
      return new Promise((resolve, reject) => {
        const index = rule.field.split('.')[1]
        const network = _this.deployForm.applications[index].network
        if (
          (network.domain && (network.domain !== '' || network.domain.length > 0)) &&
          (!value || value === '' || value.length <= 0)
        ) {
          return reject(this.$t('Deploy.PairCondition', [this.$t('Deploy.Path'), [this.$t('Deploy.Domain'), this.$t('Deploy.Path')].join(', ')]))
        }
        return resolve()
      })
    }
    const numberValidator = (rule, value) => {
      return new Promise((resolve, reject) => {
        const valueInt = parseInt(value)
        if (value && (isNaN(valueInt) && value !== '' && value !== null) || valueInt <= 0) {
          return reject(this.$t(`Validation.Input`, [this.$t('Validation.Number')]))
        }
        return resolve()
      })
    }
    const exposePortValidator = (rule, value) => {
      return new Promise((resolve, reject) => {
        const valueInt = parseInt(value)
        if (value && (isNaN(valueInt) && value !== '' && value !== null) || valueInt < 30000 || valueInt > 32767) {
          return reject(this.$t(`Validation.Range`, [30000, 32767]))
        }
        return resolve()
      })
    }
    const exposePortAvailableValidator = (rule, value) => {
      return new Promise(async(resolve, reject) => {
        const firstIndex = rule.field.split('.')[1]
        const expose_port = parseInt(value)
        if (!expose_port) return resolve()
        const { cluster_id, applications } = this.deployForm
        const cluster_name = this.remote ? this.clusterList.find((item) => item.id === cluster_id).name : 'local-cluster'
        const { name, namespace } = applications[firstIndex]
        const available = (await isExposePortAvailable(cluster_name, expose_port, {
          name: this.applicationId ? name : '',
          namespace: this.applicationId ? namespace : ''
        })).data.port_can_use
        if (!available) return reject(this.$t(`Deploy.OuterPortOccupied`))
        return resolve()
      })
    }
    return {
      loadingInstance: '',
      projectId: '',
      projectRelationIds: [],
      projectRelationList: [],
      tabName: '',
      remote: false,
      scList: [],
      clusterList: [],
      clusterId: null,
      registryList: [],
      releaseId: null,
      protocol: protocol,
      policy: policy,
      network_type: network_type,
      environments_type: environments_type,
      source_type: source_type,
      deployForm: {
        name: '',
        remote: null,
        namespace: '',
        cluster_id: '',
        registry_id: '',
        applications: []
      },
      deployFormRules: {
        name: [
          {
            required: true,
            message: this.$t(`Validation.Input`, [this.$t('Deploy.Name')]),
            trigger: 'blur'
          },
          {
            required: true,
            pattern: /^[a-z][a-z0-9-]{0,28}[a-z0-9]$/,
            message: this.$t(`Validation.Invalid`, [this.$t('Deploy.Name')]),
            trigger: 'blur'
          }
        ],
        remote: [{
          required: true,
          message: this.$t(`Validation.Select`, [this.$t('Deploy.Location')]),
          trigger: 'blur'
        }],
        cluster_id: [{
          required: true,
          message: this.$t(`Validation.Select`, [this.$t('Deploy.Cluster')]),
          trigger: 'blur'
        }],
        registry_id: [{
          required: true,
          message: this.$t(`Validation.Select`, [this.$t('Deploy.Registry')]),
          trigger: 'blur'
        }],
        namespace: [
          {
            required: true,
            message: this.$t(`Validation.Input`,
              [this.$t('Deploy.Namespace')]),
            trigger: 'blur'
          },
          {
            required: true,
            pattern: /^[a-z][a-z0-9-]{0,28}[a-z0-9]$/,
            message: this.$t(`Validation.Invalid`, [this.$t('Deploy.Namespace')]),
            trigger: 'blur'
          }
        ],
        applications: []
      },
      keyValidator,
      domainValidator,
      pathValidator,
      numberValidator,
      exposePortValidator,
      exposePortAvailableValidator
    }
  },
  computed: {
    ...mapGetters(['projectOptions']),
    applicationId () {
      return this.$route.params.applicationId
    }
  },
  watch: {
    'deployForm.applications'(applications) {
      if (applications.length === 0) return
      if (!applications.some((item) => item.project_name === this.tabName)) {
        this.tabName = applications[0].project_name
      }
    },
    async projectId(id) {
      this.projectRelationIds = []
      const hasSon = (await getHasSon(id)).has_child
      if (hasSon) {
        this.projectRelationList = await this.getProjectRelationData(id)
      } else {
        const { display } = this.projectOptions.find((item) => item.id === id)
        this.projectRelationList = [{ id: id, name: display }]
      }
      if (this.projectRelationList.length === 1) {
        this.projectRelationIds = this.projectRelationList.map((item) => item.id)
      }
    }
  },
  mounted() {
    this.getSelectionList()
    if (this.applicationId) this.getServiceDetail(this.applicationId)
  },
  methods: {
    project,
    async getSelectionList() {
      const res = (await Promise.all([
        getDeployedHostsLists(),
        getRegistryHostsLists()
      ])).map(item => item.data)
      this.clusterList = res[0].cluster
      this.registryList = res[1].registries
    },
    async getServiceDetail(value) {
      this.loadingInstance = this.$loading({
        target: '.el-form',
        text: 'Loading'
      })
      const res = await getMultiService(value)
      const application = res.data.app_header
      if (!application && !application.applications) return
      await application.applications.reduce(async(acc, item) => {
        await acc
        item.releaseList = await this.getReleaseList(item.project_id)
      }, Promise.resolve())
      Object.keys(this.deployForm).forEach((item) => {
        if (item === 'applications' && application[item].length > 0) {
          application[item].forEach((app, index) => {
            this.addApplicationRule()
            app.network.ports.forEach(() => { this.addNetworkRule(index) })
            if (app.environments) app.environments.forEach(() => { this.addEnvironmentRule(index) })
          })
        }
        this.deployForm[item] = application[item]
      })
      this.remote = this.deployForm.remote
      if (this.deployForm.cluster_id) {
        this.clusterId = this.deployForm.cluster_id
        this.scList = (await getDeployedStorageLists(this.clusterId)).data.filter((item) => item.status === 'Enabled')
      }
      this.loadingInstance.close()
    },
    changeRemote(value) {
      this.changeClusterId(value ? this.deployForm.cluster_id : 0)
    },
    changeClusterId(cluster_id) {
      if (this.scList.length > 0 && this.deployForm.applications.some((item) => item.volumes.length > 0)) {
        this.$confirm(this.$t('Notify.ChangeClusterId'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        }).then(() => {
          this.setScList(cluster_id)
        }).catch(() => {
          this.deployForm.remote = this.remote
          this.deployForm.cluster_id = this.clusterId
        })
      } else {
        this.setScList(cluster_id)
      }
    },
    async setScList(cluster_id) {
      this.remote = this.deployForm.remote
      this.clusterId = this.deployForm.cluster_id
      this.deployForm.applications.forEach((item) => { item.volumes = [] })
      this.scList = cluster_id
        ? (await getDeployedStorageLists(cluster_id)).data.filter((item) => item.status === 'Enabled')
        : []
    },
    changeSourceType(index) {
      this.deployForm.applications[index].release_id = ''
      this.deployForm.applications[index].image.uri = ''
    },
    async getReleaseList(projectId) {
      const releases = (await getReleaseVersion(projectId)).data.releases
      return releases.length === 0 ? [] : releases.map((item) => ({
        id: item.id,
        name: item.tag_name,
        value: `${item.harbor_external_base_url}/${item.image_paths[0]}`
      }))
    },
    getEnvironmentFromRelease(index) {
      const applications = this.deployForm.applications[index]
      const { release_id, environments } = applications
      if (environments.length > 0) {
        this.$confirm(this.$t('Notify.ChangeReleaseId'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        }).then(() => {
          environments.length = 0
          this.setEnvironmentFromRelease(release_id, environments)
        }).catch(() => {
          applications.release_id = this.releaseId
        })
      } else {
        this.setEnvironmentFromRelease(release_id, environments)
      }
    },
    async setEnvironmentFromRelease(release_id, environments) {
      this.releaseId = release_id
      const getEnvironment = await getReleaseEnvironments(release_id)
      if (getEnvironment.data.env.length > 0) {
        environments.push(...getEnvironment.data.env)
      }
    },
    addContainer() {
      this.projectRelationIds.reduce(async(acc, id) => {
        if (this.deployForm.applications.some((app) => app.project_id === id)) return
        const { name } = this.projectRelationList.find((project) => project.id === id)
        await acc
        const releaseList = await this.getReleaseList(id)
        this.deployForm.applications.push(
          {
            project_id: id,
            project_name: name,
            releaseList: releaseList,
            release_id: null,
            image: {
              type: '',
              uri: '',
              policy: ''
            },
            resources: {
              cpu: null,
              memory: null,
              replicas: null
            },
            network: {
              ports: [{
                port: null,
                expose_port: null,
                protocol: 'TCP'
              }],
              type: this.network_type[0],
              domain: '',
              path: ''
            },
            volumes: [],
            environments: []
          }
        )
        this.addApplicationRule()
        this.tabName = this.deployForm.applications[0].project_name
      }, Promise.resolve())
    },
    removeContainer(index) {
      this.deployForm.applications.splice(index, 1)
      this.deployFormRules.applications.splice(index, 1)
    },
    addApplicationRule() {
      this.deployFormRules.applications.push({
        release_id: [{
          required: true,
          message: this.$t('Validation.Select', [this.$t('Deploy.Release')]),
          trigger: 'blur'
        }],
        image: {
          type: [{
            required: true,
            message: this.$t('Validation.Select', [this.$t('Deploy.SourceType')]),
            trigger: 'blur'
          }],
          uri: [{
            required: true,
            message: this.$t(`Validation.Input`, [this.$t('Deploy.Path')]),
            trigger: 'blur'
          }]
        },
        resources: {
          cpu: [{ validator: this.numberValidator, trigger: 'change' }],
          memory: [{ validator: this.numberValidator, trigger: 'change' }],
          replicas: [{ validator: this.numberValidator, trigger: 'change' }]
        },
        network: {
          ports: [{
            port: [{ validator: this.numberValidator, trigger: 'change' }],
            expose_port: [
              { validator: this.numberValidator, trigger: 'change' },
              { validator: this.exposePortValidator, trigger: 'change' },
              { validator: this.exposePortAvailableValidator, trigger: 'change' }
            ]
          }],
          domain: [{ validator: this.domainValidator, trigger: 'blur' }],
          path: [{ validator: this.pathValidator, trigger: 'blur' }]
        },
        environments: []
      })
    },
    addNetwork(index) {
      this.deployForm.applications[index].network.ports.push({
        port: null,
        expose_port: null,
        protocol: 'TCP'
      })
      this.addNetworkRule(index)
    },
    removeNetwork(index, networkIndex) {
      this.deployForm.applications[index].network.ports.splice(networkIndex, 1)
      this.deployFormRules.applications[index].network.ports.splice(networkIndex, 1)
    },
    addNetworkRule(index) {
      this.deployFormRules.applications[index].network.ports.push({
        port: [{ validator: this.numberValidator, trigger: 'change' }],
        expose_port: [
          { validator: this.numberValidator, trigger: 'change' },
          { validator: this.exposePortValidator, trigger: 'change' },
          { validator: this.exposePortAvailableValidator, trigger: 'change' }
        ]
      })
    },
    addPath(index) {
      if (!this.deployForm.applications[index].volumes) this.deployForm.applications[index].volumes = []
      this.deployForm.applications[index].volumes.push({ sc_name: '', device_path: '' })
    },
    removePath(index, pathIndex) {
      this.deployForm.applications[index].volumes.splice(pathIndex, 1)
    },
    addEnvironment(index) {
      if (!this.deployForm.applications[index].environments) this.deployForm.applications[index].environments = []
      this.deployForm.applications[index].environments.push({ type: '', key: '', value: '' })
      this.addEnvironmentRule(index)
    },
    removeEnvironment(index, environmentIndex) {
      this.deployForm.applications[index].environments.splice(environmentIndex, 1)
      this.deployFormRules.applications[index].environments.splice(environmentIndex, 1)
    },
    addEnvironmentRule(index) {
      this.deployFormRules.applications[index].environments.push({
        required: true,
        type: 'array',
        validator: this.keyValidator,
        trigger: 'change'
      })
    },
    async getProjectRelationData(projectId) {
      const projectRelation = (await getProjectRelation(projectId)).data
      if (projectRelation && projectRelation[0].child.length > 0) return [...projectRelation[0].child]
      return []
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        type: 'success',
        message
      })
    },
    handleConfirm(application_id) {
      if (this.deployForm.applications.length === 0) return false
      Promise.all([
        this.$refs['deployForm'].validate(),
        this.$refs['network'].map((item) => item.validate()),
        this.$refs['volume'].map((item) => item.validate()),
        this.$refs['environment'].map((item) => item.validate())
      ].flatMap((item) => item)).then(async() => {
        const data = Object.assign({}, this.deployForm)
        if (!data.remote) {
          delete data.namespace
          delete data.cluster_id
          delete data.registry_id
        }
        this.loadingInstance = this.$loading({
          target: '.el-form',
          text: 'Loading'
        })
        try {
          if (application_id) {
            await putMultiService(application_id, { ...data })
            this.showSuccessMessage(this.$t('Notify.Updated'))
          } else {
            await postMultiService({ ...data })
            this.showSuccessMessage(this.$t('Notify.Created'))
          }
          this.loadingInstance.close()
          this.handleLeave()
        } catch (err) {
          this.loadingInstance.close()
          console.error(err)
        }
      }).catch(() => {
        return false
      })
    },
    handleLeave() {
      this.$router.push({ name: 'Deploy' })
    }
  }
}
</script>

<style scoped>
.helper {
  line-height: initial;
}
</style>
