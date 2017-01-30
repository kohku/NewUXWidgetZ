import { baseView } from './baseView'
import $ from 'jquery'
import 'jquery-ui/ui/widgets/autocomplete'
import 'jquery-ui/ui/widgets/datepicker'
import 'jquery-ui/themes/base/base.css'
import { WidgetService } from './widgetService'
import GoogleMapsLoader from 'google-maps'

export class drivingView extends baseView {
  constructor(widget, state, selector, content){
    super(widget, state, selector, content)
  }

  /*
  TODO LIST
  Autocomplete if exact match then select automatically
  */

  initialize(){
    const service = new WidgetService()

    $('.wdgtz__pick-up__location').autocomplete({
      autoFocus: true,
      source: (request, response) => {
        service.getCarPickup(request.term).then(suggestions => {
          let matchByKey = suggestions.find(item => item.key === request.term)
          if (matchByKey){
            response([matchByKey])
            this.setPickUpLocation(matchByKey)
          } else {
            response(suggestions)
            if (suggestions.length === 1){
              this.setPickUpLocation(suggestions[0])
            }
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
      autoFocus: true,
      source: (request, response) => {
        service.getCarDropoff(request.term).then(suggestions => {
          let matchByKey = suggestions.find(item => item.key === request.term)
          if (matchByKey){
            response([matchByKey])
            this.setDropOffLocation(matchByKey)
          } else {
            response(suggestions)
            if (suggestions.length === 1){
              this.setDropOffLocation(suggestions[0])
            }
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

    $.each(this.content.find('.wdgtz_pick-up .wdgtz_time-select'), (index, time) => {
      $(time).val(this.state.pickUp.format('HH:mm'))
    })
    $.each(this.content.find('.wdgtz_drop-off .wdgtz_time-select'), (index, time) => {
      $(time).val(this.state.dropOff.format('HH:mm'))
    })

    $.each(this.content.find('.wdgtz_car-company'), (index, element) => {
      service.getCarCompanies().then(all => {
        all.forEach(company => {
          $(element).append(`<option value="${company.Code}">${company.Name}</option>`)
        })
      })
    })
  }

  setPickUpLocation(item){
   this.state.flyingFromType = item.type
   this.state.flyingFrom = item.key
   this.content.find('.wdgtz__pick-up__location').val(item.value)
   // move to button
   this.content.find('.wdgtz_pick-up .wdgtz_datepicker').focus()
  }

  setDropOffLocation(item){
   this.state.flyingFromType = item.type
   this.state.flyingFrom = item.key
   this.content.find('.wdgtz__drop-off__location').val(item.value)
   // move to button
   this.content.find('.wdgtz_drop-off .wdgtz_datepicker').focus()
  }

  setListeners(){
    // Setup listeners for edit
    this.content.find('.wdgtz_edit').on('click', event => {
      this.toggleEditAddress()
      this.content.find('input.wdgtz_full-address').focus()
    })
    this.content.find('.wdgtz_starting-location input').on('change', event => this.setStartingLocation(event.target.value))
    this.content.find('.wdgtz_get-directions button').on('click', event => this.getDirections(event))
    this.content.find('.wdgtz_view-time button').on('click', event => this.viewDrivingTime(event))
    this.content.find('.wdgtz_destination input.wdgtz_full-address').on('blur keyup', (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.type === 'blur' && this.content.find('.wdgtz_destination').hasClass('editable')){
        // removing the editable class on enter triggers a blur event
        if (this.state.drivingDestination !== event.currentTarget.value){
          this.getGeoMap(event.currentTarget.value).then(response => {
            let drivingDestination = this.state.drivingDestination
            this.state.formatAddress = response[0].formatted_address
            this.setDrivingDestination(this.state.formatAddress)
            if (drivingDestination !== this.state.drivingDestination){
              this.content.find('.wdgtz_destination').addClass('edited')
            }

            if (drivingDestination !== this.state.drivingDestination){
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
        if (this.state.drivingDestination !== event.currentTarget.value){
          this.getGeoMap(event.currentTarget.value).then(response => {
            let drivingDestination = this.state.drivingDestination
            this.state.formatAddress = response[0].formatted_address
            this.setDrivingDestination(this.state.formatAddress)

            if (drivingDestination !== this.state.drivingDestination){
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

  setDrivingDestination(value){
    this.state.drivingDestination = value
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

  setDrivingTime(value){
    this.state.drivingTime = value
  }

  updateDrivingTimeDirections(){
    this.content.find('.wdgtz_driving-directions > span:first-of-type').text(`${this.state.startingLocation} to ${this.state.drivingDestination}`)
    this.content.find('.wdgtz_driving-directions > span:last-of-type').text(`Driving Time and Distance: ${this.state.drivingTime} | ${this.state.distance}`)
  }

  setDistance(value){
    this.state.distance = value
  }

  getDirections(event){
    let url = `//getmywidget.com/NewUXTripPlanz/gmaps.html?` +
    `from=${encodeURIComponent(this.state.startingLocation)}&to=${encodeURIComponent(this.state.drivingDestination)}`

    window.open(url, '_blank')
  }

  viewDrivingTime(event){
    var directionsService = new google.maps.DirectionsService()

    let request = {
      origin: this.state.startingLocation,
      destination: this.state.drivingDestination,
      travelMode: google.maps.TravelMode.DRIVING
    }
    
    directionsService.route(request, (result, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        this.setDrivingTime(result.routes[0].legs[0].duration.text.replace("horas","hrs"))
        this.setDistance(result.routes[0].legs[0].distance.text.replace("mi","miles"))
        this.content.find('.wdgtz_driving-directions').toggleClass('wdgtz_hide')
        this.updateDrivingTimeDirections()
      }
    })
  }

  doSearch(event){
    event.preventDefault()
    event.stopPropagation()

    let pickUpDate = this.state.pickUp.format('MM/DD/YYYY')
    let pickUpTime = this.state.pickUp.format('HH:mm')
    let dropOffDate = this.state.dropOff.format('MM/DD/YYYY')
    let dropOffTime = this.state.dropOff.format('HH:mm')

    let fromPlace = this.state.startingLocation
    let toPlace = this.state.drivingDestination
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
    let drivingDestination = encodeURIComponent(this.state.drivingDestination)

    let searchUrl = `${this.state.cname}/car_rentals/results/?` +
      `&from_place=${fromPlace}&to_place=${toPlace}` +
      `&rs_pu_date=${pickUpDate}&rs_pu_time=${pickUpTime}&rs_do_date=${dropOffDate}&rs_do_time=${dropOffTime}` +
      `&rs_pu_airport=${pickUpAirport}&rs_pu_cityid=${pickUpCity}` +
      `&rs_do_airport=${dropOffAirport}&rs_do_cityid=${dropOffCity}` + 
      `&rs_company=${carCompany}&dropoff=${oneWay}` +
      `&latitude=${latitude}&longitude=${longitude}&currency=${currency}&poi_name=${poiName}` +
      `&refclickid=${refClickId}&refid=${refId}&refclickid2=${refClickId2}`

     window.open(searchUrl, "_blank")
  }
}