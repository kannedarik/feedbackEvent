<template>
  <div class="block p-4">
    <header class="block section-header"></header>
    <div class="main-content-wrapper block">
      <div class="row m-0">
        <div class="col-12">
          <h2 class="mb-4">
            {{$lang.messages.verification}}
          </h2>
        </div>
        <div class="col-3">
          <label>{{$lang.messages.select_lender}}</label>
          <b-form-select v-model="selectedLender" class="form-control" :options="options">
          </b-form-select>
        </div>
        <div class="offset-1 col-3">
          <label>{{$lang.messages.select_date}}</label>
          <input type="date" class="date-style form-control" v-model="selectedDate"/>
        </div>
        <div class="offset-2 col-3">
          <button type="submit" class="btn btn-desktop-primary btn-block float-right"
            :disabled="(!selectedLender || !selectedDate)" @click="getMisFiles">
            {{$lang.messages.download_misfiles}}
          </button>
        </div>
        <div class="col-12">
          <div class="table-sec mt-4">
            <b-card no-body>
              <b-tabs card>
                <b-tab v-for="(lender, index) in lenders" :key="index"
                  :title="lender.lender" :id="lender.lender">
                  <div class="mb-3" v-if="lender.data.length > 0">
                    <b-card no-body class="mb-3 white-background"
                      v-for="(data, indexValue) in lender.data" :key="indexValue">
                      <b-card-header header-tag="header" role="tab">
                        <b-button block v-b-toggle="`accordion-${index+indexValue}`"
                          class="text-capitalize text-left btn-rupeek">
                          Loan ID: {{data.loanaccountnumber}}
                        </b-button>
                      </b-card-header>
                      <b-collapse :id="`accordion-${index+indexValue}`"
                        visible accordion="my-accordion" role="tabpanel">
                        <b-card-body>
                          <table class="table table-striped table-hover">
                            <thead>
                              <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Detected At</th>
                                <th scope="col">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(invalidkey, key) in data.invalidkeys"
                                :key="key">
                                <td>
                                  {{invalidkey.name}}
                                </td>
                                <td>
                                  {{moment(invalidkey.createdOn)
                                  .format('DD/MM/YYYY hh:mm a')}}
                                </td>
                                <td>
                                  <b-button variant="outline-primary" class="px-3 py-1"
                                    @click="updateKeys({
                                      'lenderid':lender.lender,
                                      'loanid':data.loanaccountnumber,
                                      'resolvedkey':[invalidkey.name]
                                    })">
                                    Resolved
                                  </b-button>
                                </td>
                                <!-- index, indexValue, key -->
                              </tr>
                            </tbody>
                          </table>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                  </div>
                  <div class="p-3 bg-blue rounded font-weight-bold white-color" v-else>
                    {{ $lang.messages.no_data_msg }}
                  </div>
                </b-tab>
              </b-tabs>
            </b-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// importing moment for date and time manipulations
import moment from 'moment';
import { getInvalidDataAPI, updateKeysAPI, getMisFilesAPI } from '../../api/verification.api';

export default {
  name: 'verification',
  data() {
    return {
      // variable is used to store selected date
      selectedDate: '',
      // variable is used to store selected lender
      selectedLender: null,
      // Array is used to store lenders
      options: [{ value: null, text: 'Please select lender' }],
      // Array is used to store all invalid data
      lenders: [],
    };
  },
  methods: {
    // Moment function
    moment(data) {
      return moment(data);
    },
    // API call for get invalid data
    getInvalidData() {
      const select = this.options[0];
      this.options = [];
      this.options.push(select);
      getInvalidDataAPI()
        .then((response) => {
          if (response.data.invalidData) {
            this.lenders = response.data.invalidData;
            this.lenders.map((key) => {
              const data = {};
              data.value = key.lender;
              if (key.lender === 'icici') {
                data.text = 'ICICI';
              } else if (key.lender === 'kvb') {
                data.text = 'KVB';
              } else if (key.lender === 'federal') {
                data.text = 'Federal';
              } else if (key.lender === 'rupeek') {
                data.text = 'Rupeek';
              }
              this.options.push(data);
              return true;
            });
          } else {
            this.$noty.error(response.data.message);
          }
        })
        .catch((err) => {
          this.$noty.error(err.message);
        });
    },
    // API call for update keys
    updateKeys(tempObj) {
      updateKeysAPI(tempObj)
        .then((response) => {
          if (response.status === 200) {
            this.$noty.success(response.data.message);
            // API call for get invalid data
            this.getInvalidData();
          }
        })
        .catch((err) => {
          this.$noty.error(err.message);
        });
    },
    // API call for downloand misfiles
    getMisFiles() {
      const tempObj = {};
      tempObj.lenderid = this.selected;
      tempObj.misdatadate = moment(this.selectedDate).format('DD/MM/YYYY');
      getMisFilesAPI(tempObj)
        .then((response) => {
          if (response.status === 200) {
            if (response.data.signedurl) {
              window.open(response.data.signedurl, '_blank');
            } else {
              this.$noty.error(response.data.message);
            }
          }
        })
        .catch((err) => {
          this.$noty.error(err.message);
        });
    },
  },
  mounted() {
    // API call for get invalid data
    this.getInvalidData();
  },
};
</script>

<style scoped>
</style>
