import { baseView } from './baseView'
import $ from 'jquery'
import 'jquery-ui/ui/widgets/autocomplete'
import 'jquery-ui/ui/widgets/datepicker'
import 'jquery-ui/themes/base/base.css'
import { WidgetService } from './widgetService'

export class drivingView extends baseView {
  constructor(widget, state, selector, content){
    super(widget, state, selector, content)
  }


  /*
  TODO LIST

  Get directions
  View driving time

  Autocomplete if exact match then select automatically

  */

  initialize(){
    const service = new WidgetService()

    $('.wdgtz__pick-up__location').autocomplete({
      source: (request, response) => {
        service.getCarPickup(request.term).then(suggestions => {
          let matchByKey = suggestions.find(item => item.key === request.term)

          if (matchByKey){
            response([matchByKey])
          } else {
            response(suggestions)
          }
        }).catch(error => {
          response(error.status || error.message)
        })
      },
      minLength: 2,
      select: (event, ui) => {
        this.state.pickUpType = ui.item.type 
        this.state.pickUpPlace = ui.item.key 
      },
    })

    $('.wdgtz__drop-off__location').autocomplete({
      source: (request, response) => {
        service.getCarDropoff(request.term).then(suggestions => {
          let matchByKey = suggestions.find(item => item.key === request.term)

          if (matchByKey){
            response([matchByKey])
          } else {
            response(suggestions)
          }
        }).catch(error => {
          response(error.status || error.message)
        })
      },
      minLength: 2,
      select: (event, ui) => {
        this.state.dropOffType = ui.item.type
        this.state.dropOffPlace = ui.item.key
      },
    })

    this.content.find('.wdgtz_options .wdgtz_params input.wdgtz_datepicker').datepicker({
      dateFormat: 'dMy',
      minDate: 0,
      maxDate: null,
      dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    })

    $.each(this.content.find('.wdgtz_pick-up .wdgtz_datepicker'), (index, datepicker) => {
      $(datepicker).datepicker("setDate", this.state.pickUp.toDate())
    })

    $.each(this.content.find('.wdgtz_drop-off .wdgtz_datepicker'), (index, datepicker) => {
      $(datepicker).datepicker("setDate", this.state.dropOff.toDate())
    })

    const defaultTime = '12:00'
    $.each(this.content.find('.wdgtz_time-select'), (index, time) => {
      $(time).val(defaultTime)
    })

    $.each($('.wdgtz_car-company'), (index, element) => {
      service.getCarCompanies().then(all => {
        all.forEach(company => {
          $(element).append(`<option value="${company.Code}">${company.Name}</option>`)
        })
      })
    })
  }

  setListeners(){
    // Setup listeners for edit
    this.content.find('.wdgtz_edit').on('click', event => {
      this.toggleEditAddress()
      this.content.find('input.wdgtz_full-address').focus()
    })
    this.content.find('.wdgtz_starting-location input').on('change', event => this.setStartingLocation(event.target.value))
    this.content.find('.wdgtz_get-directions button').on('click', event => this.getDirections(event))
    this.content.find('.wdgtz_view-time button')
    this.content.find('.wdgtz_destination input.wdgtz_full-address').on('blur keyup', (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.type === 'blur' && this.content.find('.wdgtz_destination').hasClass('editable')){
        // removing the editable class on enter triggers a blur event
        if (this.state.fullAddress !== event.currentTarget.value){
          this.getGeoMap(event.currentTarget.value).then(response => {
            let fullAddress = this.state.fullAddress
            this.state.formatAddress = response[0].formatted_address
            this.setFullAddress(this.state.formatAddress)
            if (fullAddress !== this.state.fullAddress){
              this.content.find('.wdgtz_destination').addClass('edited')
            }

            if (fullAddress !== this.state.fullAddress){
              this.content.find('.wdgtz_destination').addClass('edited')
            }

            if (!this.state.latitude && !this.state.longitude){
              this.state.latitude = response[0].geometry.location.lat()
              this.state.longitude = response[0].geometry.location.lng()
            }
            
            this.toggleEditAddress()
          })
        } else {
          this.toggleEditAddress()
        }
      } 
      if (event.keyCode == 27) {
        this.toggleEditAddress()
      }
      if (event.keyCode == 13) {
        // removing the editable class on enter triggers a blur event
        if (this.state.fullAddress !== event.currentTarget.value){
          this.getGeoMap(event.currentTarget.value).then(response => {
            let fullAddress = this.state.fullAddress
            this.state.formatAddress = response[0].formatted_address
            this.setFullAddress(this.state.formatAddress)

            if (fullAddress !== this.state.fullAddress){
              this.content.find('.wdgtz_destination').addClass('edited')
            }

            if (!this.state.latitude && !this.state.longitude){
              this.state.latitude = response[0].geometry.location.lat()
              this.state.longitude = response[0].geometry.location.lng()
            }

            this.toggleEditAddress()
          })
        } else {
          this.toggleEditAddress()
        }
      }
    })

    $('.wdgtz__pick-up__location').on('change', (event) => {
      if (!ui.item.type){
        this.state.pickUpType = null 
        this.state.pickUpPlace = null 
      }
    })

    $('.wdgtz__drop-off__location').on('change', (event) => {
      if (!ui.item.type){
        this.state.dropOffType = null 
        this.state.dropOffPlace = null 
      }
    })

    $('.wdgtz_trip-rule input[type="radio"]').on('change', (event) => {
      this.state.oneWay = event.target.value === 'oneway'
    })

    // More/fewer options listeners
    this.content.find('.wdgtz_options > label').on('click', event => this.toggleRentalCarOptions(event))
    this.content.find('.wdgtz_options .wdgtz_params input[type="radio"]').on('change', event => this.toggleTripRule(event))

    $('.wdgtz_pick-up .wdgtz_time-select').on('change', event => this.setPickUpTime(event.target.value))

    $('.wdgtz_drop-off .wdgtz_time-select').on('change', event => this.setDropOffTime(event.target.value))

    $('.wdgtz_car-company').on('change', event => this.setCarCompany(event.target.value))
    
   // Search
    this.content.find('.wdgtz_action').on('click', event => this.doSearch(event))
  }

  getGeoMap(address){
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder()
      // get map
      geocoder.geocode({'address': address}, (response, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          resolve(response)
        } else {
          reject(status)
        }
      })
    })
  }

  setPickUpTime(value){
    if (value){
      let parts = value.split(':')
      this.state.pickUp.set('hour', parseInt(parts[0]))
      this.state.pickUp.set('minute', parseInt(parts[1]))
    }
  }

  setDropOffTime(value){
    if (value){
      let parts = value.split(':')
      this.state.dropOff.set('hour', parseInt(parts[0]))
      this.state.dropOff.set('minute', parseInt(parts[1]))
    }
  }

  setStartingLocation(value){
    this.state.startingLocation = value
  }

  setFullAddress(value){
    this.state.fullAddress = value
    this.content.find('input.wdgtz_full-address').val(value)
    this.content.find('span.wdgtz_full-address').text(value)
  }

  setCarCompany(value) {
    this.state.carCompany = value ? value : null
  }

  toggleEditAddress(){
    this.content.find('.wdgtz_destination').toggleClass('editable')
  }

  toggleTripRule(event){
    if (event.currentTarget.value === 'oneway'){
      this.content.find('.wdgtz_options .wdgtz_params').addClass('wdgtz_trip-rule-oneway')
    } else {
      this.content.find('.wdgtz_options .wdgtz_params').removeClass('wdgtz_trip-rule-oneway')
    }
  }

  toggleRentalCarOptions(event){
    event.preventDefault()
    $(event.currentTarget.parentElement).toggleClass('wdgtz_expanded')
  }

  getDirections(event){

  }

  viewDrivingTime(event){

  }

  doSearch(event){
    event.preventDefault()
    event.stopPropagation()

    let pickUpDate = this.state.pickUp.format('MM/DD/YYYY')
    let pickUpTime = this.state.pickUp.format('hh:mm')
    let dropOffDate = this.state.dropOff.format('MM/DD/YYYY')
    let dropOffTime = this.state.dropOff.format('hh:mm')

    let fromPlace = this.state.startingLocation
    let toPlace = this.state.fullAddress
    let pickUpAirport = this.state.pickUpType === 'AIR' ? this.state.pickUpPlace : '' 
    let pickUpCity = this.state.pickUpType === 'CITY' ? this.state.pickUpPlace : ''
    let dropOffAirport = this.state.dropOffType === 'AIR' ? this.state.dropOffPlace : ''
    let dropOffCity = this.state.dropOffType === 'CITY' ? this.state.dropOffPlace : ''
    let carCompany = this.state.carCompany
    let oneWay = this.state.oneWay || false

    let latitude = this.state.latitude
    let longitude = this.state.longitude
    let currency = this.state.currency
    let poiName = encodeURIComponent(this.state.poiName) //encodeURIComponent
    let refClickId = this.state.refClickId ? encodeURIComponent(this.state.refClickId) : '' // encodeURIComponent
    let refId = this.state.refId
    let refClickId2 = this.state.refClickId2 ? encodeURIComponent(this.state.refClickId2) : ''
    let fullAddress = encodeURIComponent(this.state.fullAddress)

    let searchUrl = `${this.state.cname}/car_rentals/results/?` +
      `&from_place=${fromPlace}&to_place=${toPlace}&check_time=&check_directions=` +
      `&rs_pu_date=${pickUpDate}&rs_pu_time=${pickUpTime}&rs_do_date=${dropOffDate}&rs_do_time=${dropOffTime}` +
      `&rs_pu_airport=${pickUpAirport}&rs_pu_cityid=${pickUpCity}` +
      `&rs_do_airport=${dropOffAirport}&rs_do_cityid=${dropOffCity}` + 
      `&rs_company=${carCompany}&dropoff=${oneWay}` +
      `&latitude=${latitude}&longitude=${longitude}&currency=${currency}&poi_name=${poiName}` +
      `&refclickid=${refClickId}&refid=${refId}&refclickid2=${refClickId2}`

     window.open(searchUrl, "_blank")
  }
}