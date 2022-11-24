<template>
  <div class="position-relative">
    <div>
      <label class="adderss">
        <gmap-autocomplete
          @place_changed="setPlace"
          :value="addressInput"
          placeholder="Search Delivery Location"
        >
        </gmap-autocomplete>
        <img
          class="search-icon position-relative"
          src="@/assets/icons/search_icon.svg"
        />
      </label>
    </div>
    <gmap-map
      :center="center"
      :zoom="16"
      :options="gmapOptions"
      style="width: 100%; height: 250px"
    >
      <gmap-marker
        :icon="{ url: require('@/assets/icons/map_marker_icon.svg')}"
        :position="markers.position"
        :clickable="true"
        :draggable="true"
        @drag="handleMarkerDrag($event)"
        @click="panToMarker"
      ></gmap-marker>
    </gmap-map>
  </div>
</template>

<script>
import each from 'lodash/each';
import filter from 'lodash/filter';
import find from 'lodash/find';
import head from 'lodash/head';
import includes from 'lodash/includes';
import store from '@/store';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';

export default {
  name: 'GoogleMapView',
  data() {
    return {
      center: { lat: 12.91, lng: 77.60 },
      markers: {},
      places: {},
      currentPlace: null,
      gmapOptions: {
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        disableDefaultUi: false,

      },
      addressInput: '',
    };
  },
  props: {
    fullAddress: {
      type: Object,
      required: true,
    },
  },
  watch: {
    // fullAddress this variable whenever update call this function
    fullAddress(value) {
      this.setPlace(value);
    },
  },
  methods: {
    // function call to set the marker selected address and get the address
    setPlace(place) {
      this.currentPlace = place;
      const marker = {
        lat: this.currentPlace.geometry.location.lat(),
        lng: this.currentPlace.geometry.location.lng(),
      };
      this.center = marker;
      this.markers = { position: marker };
      this.addMarker();
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_SELECTED_ADDRESS_MAPS,
        [events.PAYMENT_ACTION]: 'release',
      };
      sendEvent(events.screen.ADDRESS_SELECTION, events.category.PAYMENT, properties);
    },
    // function call to set the marker and get the selected address object
    addMarker() {
      if (this.currentPlace) {
        this.places = this.currentPlace;
        this.addressInput = this.places.formatted_address;
        const place = this.places.address_components;

        const pincode = find(place, (component) => includes(component.types, 'postal_code'));
        const area = this.extractComponent((place),
          ['sublocality_level_1', 'sublocality_level_2', 'sublocality', 'locality']);
        const subarea = find(place, (address) => includes(address.types, 'sublocality_level_2'));
        const apartment = this.extractComponent(place,
          ['sublocality_level_3', 'sublocality_level_4', 'sublocality_level_5', 'neighborhood']);
        const street = find(place, (component) => includes(component.types, 'route'));
        const state = find(place, (comp) => includes(comp.types, 'administrative_area_level_1'));
        const city = find(place, (component) => includes(component.types, 'locality'));

        // Address Obj
        const addressList = {
          floor: '',
          apartment: apartment ? apartment.long_name : '',
          street: street ? street.long_name : '',
          subarea: subarea ? subarea.long_name : '',
          area: area ? area.long_name : '',
          address_type: 'home',
          source: 'Web',
          city: city ? city.long_name : '',
          state: state ? state.long_name : '',
          pincode: pincode ? pincode.long_name : '',
          latitude: this.center.lat,
          longitude: this.center.lng,
          displayText: this.addressInput,
        };
        store.dispatch('releaseSlotBooking/setGmapAddress', addressList);
        this.currentPlace = null;
      }
    },
    // function call toe extract the address
    extractComponent(addressCompt, types) {
      let result = null;
      each(types, (type) => {
        const filtered = filter(addressCompt, (component) => includes(component.types, type));
        if (filtered.length > 0) {
          result = head(filtered);
          return false;
        }
        return true;
      });

      return result;
    },
    // function call to get the defult geo location
    geolocate() {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.panToMarker();
      });
    },
    // function call to handle the marker drag
    handleMarkerDrag(place) {
      this.center = { lat: place.latLng.lat(), lng: place.latLng.lng() };
      this.panToMarker();
    },
    // Moves the map view port to marker
    panToMarker() {
      this.markers = { position: this.center };
      this.getStreetAddressFrom();
    },
    // function call to get address details based marker drags
    getStreetAddressFrom() {
      this.$geocoder.send(this.center, (response) => {
        const test = response.results[0];
        this.currentPlace = test;
        this.addMarker();
      });
    },
  },
  mounted() {
    // function call to get the defult geo location
    this.geolocate();
  },
};
</script>
