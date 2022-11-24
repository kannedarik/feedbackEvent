<template>
  <div class="container-fluid">
    <!-- Heading section -->
    <div class="row border-bottom pb-2">
      <div class="col-12 d-flex align-items-center justify-content-between flex-wrap">
        <div class="col-9 p-0 mb-sm-2 mb-md-0 page-title">
          <h1 class="text-capitalize">{{ $lang.messages.processor }}</h1>
        </div>

        <div class="col-3 p-0">
          <b-button variant="primary" size="sm" class="text-capitalize mr-sm-2 float-right" v-b-modal.createModal>
            {{ $lang.messages.upload }}
            <font-awesome-icon icon="plus-circle" class="ml-1"></font-awesome-icon>
          </b-button>
        </div>
      </div>
    </div>

    <!-- Body section -->
    <div class="row pt-2">
      <div class="col-12">
        <div class="row" v-if="processors.length > 0">
          <div class="col-lg-6 col-md-6 col-sm-6 col-xs-12" v-for="processor in processors" :key="processor._id">
            <div class="campaign full-width-block mb-3">
              <header class="full-width-block d-flex justify-content-between px-2">
                <div class="name-icon d-flex">
                  <div class="campaign-icon" :class="`${processor.file.lender.slug}-icon`"></div>
                  <div class="campaign-name-status">
                    <h4>{{ processor.file.filename }}</h4>
                    <b-badge variant="info" class="mr-1">{{ processor.file.purpose }}</b-badge>
                    <b-badge variant="success">{{ processor.status }}</b-badge>
                  </div>
                </div>
                <b-button-group>
                  <b-button variant="outline-secondary" @click="execute(processor._id)" v-if="processor.status === 'CREATED'"><font-awesome-icon icon="play"></font-awesome-icon></b-button>
                  <b-button variant="outline-secondary" @click="download(processor._id)" v-if="processor.status === 'FINISHED'"><font-awesome-icon icon="download"></font-awesome-icon></b-button>
                </b-button-group>
              </header>
              <section class="status-count-wrapper full-width-block">
                <ul class="full-width-block d-flex justify-content-between font-small">
                  <li><strong>Count</strong>{{ processor.progress.count.toLocaleString('en-IN') }}</li>
                  <li><strong>Processed</strong>{{ processor.progress.progress.toLocaleString('en-IN') }}</li>
                  <li><strong>Success</strong>{{ processor.progress.success.toLocaleString('en-IN') }}</li>
                  <li><strong>Failure</strong>{{ processor.progress.failure.toLocaleString('en-IN') }}</li>
                </ul>
              </section>
              <footer class="full-width-block">
                <div class="progress-status">
                  <div :title="`Processed: ${processor.progress.progress}`" class="progressed" :style="`width: ${(processor.progress.progress / processor.progress.count) * 100}%;`"></div>
                  <div class="success-failure">
                    <div :title="`Success: ${processor.progress.success}`" class="success d-inline-block" :style="`width: ${(processor.progress.success / processor.progress.count) * 100}%;`"></div>
                    <div :title="`Failure: ${processor.progress.failure}`" class="failure d-inline-block" :style="`width: ${(processor.progress.failure / processor.progress.count) * 100}%;`"></div>
                  </div>
                </div>
              </footer>
            </div>
          </div>
          <div class="col-12">
            <b-pagination v-model="currentPage" :per-page="perPage" :total-rows="totalDocs" align="center" @input="listProcessors({ page: currentPage, limit: perPage })"></b-pagination>
          </div>
        </div>
        <div class="col-12 text-center" v-if="processors.length === 0">
          <h4>{{ $lang.messages.no_data_msg }}</h4>
        </div>
      </div>
    </div>

    <!-- Create modal -->
    <b-modal ref="createModal" id="createModal" centered body-class="" footer-class="justify-content-center" no-close-on-backdrop no-close-on-esc>
      <div slot="modal-header">
        <h2 class="modal-title text-capitalize">{{ $lang.messages.create }} {{ $lang.messages.processor }}</h2>
      </div>
      <b-container fluid>
        <b-row class="mb-1">
          <div class="col-12 mb-2" v-if="!form.file._id">
            <b-form-file
              v-model="form.file.file"
              placeholder="Choose a file or drop it here..."
              drop-placeholder="Drop file here..."
              :state="!$v.form.file.file.$invalid">
            </b-form-file>
          </div>
          <div class="col-12 mb-2" v-if="!form.file._id">
            <label for="place-type" class="text-capitalize mb-1">{{ $lang.messages.select_lender }}</label>
            <multiselect :close-on-select="true"
                         v-model="form.file.lender"
                         :options="lenders"
                         label="name"
                         track-by="id"
                         :allow-empty="false"
                         :show-labels="false">
            </multiselect>
          </div>
          <div class="col-12 mb-2" v-if="!form.file._id">
            <label class="text-capitalize mb-1">{{ $lang.messages.select_purpose }}</label>
            <b-form-select class="mb-2 mr-sm-2 mb-sm-0 text-capitalize"
                           v-model="form.file.purpose"
                           :options="purposes"
                           :state="!$v.form.file.purpose.$invalid">
            </b-form-select>
          </div>
          <div class="col-12 mb-2" v-if="form.file._id">File: {{ this.form.file.filename }}</div>
          <div class="col-12 mb-2" v-if="form.file._id">
            <label class="text-capitalize mb-1">{{ $lang.messages.select_task }}</label>
            <b-form-select class="mb-2 mr-sm-2 mb-sm-0 text-capitalize"
                           v-model="form.task"
                           :options="tasks"
                           :state="!$v.form.task.$invalid">
            </b-form-select>
          </div>
        </b-row>
      </b-container>
      <template slot="modal-footer" slot-scope="{ cancel }">
        <b-button variant="success" v-if="form.file._id" :disabled="$v.form.$invalid" @click="create">{{ $lang.messages.create }}</b-button>
        <b-button variant="success" v-else :disabled="$v.form.file.$invalid" @click="upload">{{ $lang.messages.upload }}</b-button>
        <b-button variant="danger" v-if="!form.file._id" @click="cancel()">{{ $lang.messages.cancel }}</b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
/* eslint-disable no-underscore-dangle */
import find from 'lodash/find';
import map from 'lodash/map';
import { saveAs } from 'file-saver';
import { mapGetters, mapActions } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import create from '../../api/file.api';
import { downloadLog, executeProcessor } from '../../api/processor.api';
import ds from '../../deepstream';
import constants from '../../constants';

export default {
  name: 'FileProcessor',
  data() {
    return {
      form: {
        file: {},
      },
      purposes: constants.filePurposes,
      tasks: constants.taskList,
      currentPage: 1,
      perPage: 10,
    };
  },
  mixins: [
    validationMixin,
  ],
  validations() {
    return {
      form: {
        ...(!this.form.file._id && {
          file: {
            file: {
              required,
            },
            lender: {
              required,
            },
            purpose: {
              required,
            },
          },
        }),
        task: {
          required,
        },
      },
    };
  },
  computed: {
    ...mapGetters({
      lenders: 'data/listLenders',
      totalDocs: 'processor/totalDocs',
      listProcessor: 'processor/listProcessors',
    }),
    processors() {
      return map(this.listProcessor, processor => ({
        ...processor,
        file: {
          ...processor.file,
          lender: find(this.lenders, { id: parseInt(processor.file.lender, 10) }),
        },
      }));
    },
  },
  methods: {
    ...mapActions({
      listLender: 'data/lenders',
      listProcessors: 'processor/list',
      createProcessor: 'processor/create',
      editProcessor: 'processor/edit',
    }),
    async upload() {
      try {
        const response = await create(this.form.file);
        this.form.file = response.data.file;

        this.$noty.success(response.data.message);
      } catch (err) {
        console.log(err);
        this.$noty.error(err.response ? (err.response.data.message || err.response.data) : err);
      }
    },
    async create() {
      try {
        await this.createProcessor(this.form);
        this.form = {
          file: {},
        };
        this.$refs.createModal.hide();
      } catch (err) {
        this.$noty.error(err.response ? (err.response.data.message || err.response.data) : err);
      }
    },
    async execute(id) {
      try {
        const result = await this.$swal({
          title: 'Are you sure?',
          text: 'You are about to start processing',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, process it!',
        });

        if (result.value) {
          await executeProcessor(id);
        }
      } catch (err) {
        this.$noty.error(err.response ? (err.response.data.message || err.response.data) : err);
      }
    },
    async download(id) {
      try {
        const response = await downloadLog(id);
        const blob = new Blob([response.data]);
        saveAs(blob, `${id}_errors.csv`);

        this.$noty.success('Download is in progress');
      } catch (err) {
        this.$noty.error(err.response ? (err.response.data.message || err.response.data) : err);
      }
    },
  },
  created() {
    // processor subscription
    ds.event.subscribe(constants.deepstream.topic.processor, (msg) => {
      this.editProcessor(msg);
    });
  },
  mounted() {
    this.listLender()
      .then(() => {
        this.listProcessors({ page: this.currentPage, limit: this.perPage });
      })
      .catch((err) => {
        this.$noty.error(err.response ? (err.response.data.message || err.response.data) : err);
      });
  },
  beforeDestroy() {
    // unsubscribe transaction
    ds.event.unsubscribe(constants.deepstream.topic.processor);
  },
};
</script>

<style scoped>
.campaign {
  border: 1px solid #dddbda;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.1);
  background-color: #fbfbfb;
  border-radius: 3px;
}

.campaign header {
  padding: 20px 10px 10px;
  border-bottom: 1px solid #ddd;
}

.campaign-icon {
  max-width: 32px;
  width: 32px;
  margin-right: 10px;
  height: 32px;
  background-color: #fff;
}

.campaign-name-status h4 {
  font-size: 0.95rem;
}

.status-count-wrapper {
  background-color: #fbfbfb;
  padding: 5px 10px;
  border-bottom: 1px solid #ddd;
}

.status-count-wrapper ul {
  padding: 0;
  margin: 0;
}

.status-count-wrapper ul li {
  text-align: center;
  display: inline-block;
  list-style: none;
}

.status-count-wrapper strong {
  display: block;
}

.campaign footer {
  padding: 10px;
}

.progress-status {
  background-color: #ddd;
  position: relative;
  overflow: hidden;
}

.progressed {
  height: 10px;
  background-color: #5eb4ff;
  width: 0;
  position: relative;
}

.progress-status .success-failure {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  z-index: 111;
}

.progress-status .success-failure .failure, .progress-status .success-failure .success, .progress-status .success-failure .unknown {
  float: left;
  position: relative;
  z-index: 11111;
  height: 10px;
}

.progress-status .success-failure .success {
  background-color: green;
}

.progress-status .success-failure .failure {
  background-color: red;
}

.font-small {
  font-size: 0.88rem;
}
</style>
