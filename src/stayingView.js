import { baseView } from './baseView'
import $ from 'jquery'
import 'jquery-ui/ui/widget'
import 'jquery-ui/ui/widgets/button'
import 'jquery-ui/ui/widgets/datepicker'
import 'jquery-ui/ui/widgets/menu'
import 'jquery-ui/themes/base/base.css'
import 'tooltipster'
import 'tooltipster/src/css/tooltipster.css'
import moment from 'moment'
import 'imports-loader?jQuery=jquery,moment=moment,this=>window!./jquery.comiseo.daterangepicker.js'
import 'style-loader?css-loader!./jquery.comiseo.daterangepicker.css'
import { WidgetService } from './widgetService'
import GoogleMapsLoader from 'google-maps'

export class stayingView extends baseView{
  constructor(widget, state, selector, content){
    super(widget, state, selector, content)
    // Setting up google maps loader
    GoogleMapsLoader.KEY = 'AIzaSyDOXBsxcH9pqCRm0NES6EU4wQvBDgql0ZI'
    GoogleMapsLoader.LIBRARIES = ['geometry','places']

    GoogleMapsLoader.onLoad(google => {
      this.getGeoMap(this.state.stayingDestination).then(response => {
        this.setStayingDestination(response[0].formatted_address)
        if (!this.state.latitude || !this.state.longitude){
          this.setLatitudeLongitude(response[0])
        }
        this.updateMapAddress(response[0])
      })
    })
  }

  initialize(){
    // Loading maps
    GoogleMapsLoader.load()

    const service = new WidgetService()

    if (this.state.pictureUrl){
      $.each(this.content.find('.wdgtz_front .wdgtz_canvas'), (index, canvas) => {
        let canva$ = $(canvas)
        canva$.css('background-image', `url(${this.state.pictureUrl})`)
        canva$.html(canva$.html().replace('Picture', ''))
      })
    }

    let clearText
    if (this.state.eventName && this.state.eventStart && this.state.eventEnd){
      clearText = `Select dates ${this.state.eventName} ${this.state.eventStart.format("MM/DD")} - ${this.state.eventEnd.format("MM/DD")}`
    }  

    this.rangePicker = this.content.find('input[name="daterange"]')
    this.rangePicker.daterangepicker({
        presetRanges: [],
        initialText: 'SELECT TRAVEL DATES',
        autoFitCalendars: true,
        applyButtonText: 'Done',
        clearButtonText: clearText || "Select dates",
        icon: '',
        applyOnMenuSelect: false,
        dateFormat: 'dMy',
        datepickerOptions : {
            numberOfMonths : 1,
            minDate: 0,
            maxDate: null,
            dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        },
        change: (event, calendar) => this.setDates(event, calendar),
        open: (event, calendar) => this.updateCalendar(event, calendar),
    })
    this.rangePicker.daterangepicker("setRange", {
       start: this.state.checkIn.toDate(), 
       end: this.state.checkOut.toDate() 
    });

    // load guest
    if (this.state.defaultGuests){
      $.each(this.content.find('.wdgtz_guest'), (index, guests) => {
        $(guests).val(this.state.defaultGuests)
      })
    }

    // load rooms
    if (this.state.defaultRooms){
      $.each(this.content.find('.wdgtz_rooms'), (index, rooms) => {
        $(rooms).val(this.state.defaultRooms)
      })
    }

    // load hotel chain
    $.each(this.content.find('.wdgtz_hotel-chain'), (index, element) => {
      service.getHotelChains().then(all => {
        all.forEach(chain => {
          $(element).append(`<option value="${chain.key}">${chain.value}</option>`)
        })
      })
    })

    // load hotel raiting
    $.each(this.content.find('.wdgtz_hotel-rating'), (index, element) => {
      service.getHotelRaiting().then(all => {
        let ratings = all.filter(rating => this.state.hotelRating.indexOf(rating.key) >= 0)
        ratings.forEach(rating => {
          $(element).append(`<option value="${rating.key}">${rating.value}</option>`)
        })
      })
    })

    this.content.find('.wdgtz_best-rate-promise').tooltipster({
      interactive: true,
      side: 'bottom'
    })
  }

  setListeners(){
    // Setup listeners for edit
    this.content.find('.wdgtz_edit').on('click', event => {
      this.toggleEditAddress()
      this.content.find('input.wdgtz_full-address').focus()
    })
    // Widget Url
    if (this.state.widgetUrl){
      this.content.find('.wdgtz_front .wdgtz_canvas').on('click', event => this.openWidgetUrl(event))
    }
    // Flip for map picture
    this.content.find('.wdgtz_flip').on('click', event => this.flipMapPicture(event))
    // More/fewer options listeners
    this.content.find('.wdgtz_details .wdgtz_options .wdgtz_options-more').on('click', event => this.toggleMoreFewerOptions(event))
    // form elements
    this.content.find('.wdgtz_guest').on('change', event => this.setGuests(parseInt(event.currentTarget.value)))
    this.content.find('.wdgtz_rooms').on('change', event => this.setRooms(parseInt(event.currentTarget.value)))
    this.content.find('.wdgtz_guest').on('change', event => this.setHotelChain(parseInt(event.currentTarget.value)))
    this.content.find('.wdgtz_hotel-chain').on('change', event => this.setHotelChain(event.currentTarget.value))
    this.content.find('.wdgtz_hotel-rating').on('change', event => this.setHotelRating(parseInt(event.currentTarget.value)))
    this.content.find('.wdgtz_full-address').on('blur keyup', event => {
      event.preventDefault()
      event.stopPropagation()
      if (event.type === 'blur' && this.content.find('.wdgtz_header').hasClass('editable')) {
        // removing the editable class on enter triggers a blur event
        if (this.state.stayingDestination !== event.currentTarget.value){
          this.getGeoMap(event.currentTarget.value).then(response => {
            let stayingDestination = this.state.stayingDestination
            this.state.formatAddress = response[0].formatted_address
            this.setStayingDestination(this.state.formatAddress)

            if (stayingDestination !== this.state.stayingDestination){
              this.content.find('.wdgtz_header').addClass('edited')
              this.setLatitudeLongitude(response[0])
              this.updateMapAddress(response[0])
            }
          })
        }
        this.toggleEditAddress()
      }

      if (event.keyCode == 27) {
        this.toggleEditAddress()
      }
      
      if (event.keyCode == 13) {
        // removing the editable class on enter triggers a blur event
        if (this.state.stayingDestination !== event.currentTarget.value){
          this.getGeoMap(event.currentTarget.value).then(response => {
            let stayingDestination = this.state.stayingDestination
            this.state.formatAddress = response[0].formatted_address
            this.setStayingDestination(this.state.formatAddress)

            if (stayingDestination !== this.state.stayingDestination){
              this.content.find('.wdgtz_header').addClass('edited')
            }
            this.setLatitudeLongitude(response[0])
            this.updateMapAddress(response[0])
          })
        }
        this.toggleEditAddress()
      }
    })
    // Search
    this.content.find('.wdgtz_action button').on('click', event => this.doSearch(event))
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

  setLatitudeLongitude(response){
    this.state.latitude = response.geometry.location.lat()
    this.state.longitude = response.geometry.location.lng()
  }

  updateMapAddress(response){
    let options = { zoom: 8}
    const map = new google.maps.Map(document.getElementById('wdgtz_hotel-map'), options)
    map.setCenter(response.geometry.location)
    var marker = new google.maps.Marker({ map: map, position: response.geometry.location })
    marker.setMap(map)
    map.setCenter(response.geometry.location)
  }

  toggleEditAddress(){
    this.content.find('.wdgtz_header').toggleClass('editable')
  }

  openWidgetUrl(event){
    window.open(this.state.widgetUrl, '_blank');
  }

  flipMapPicture(event){
    event.preventDefault()
    event.stopPropagation()
    $('.wdgtz_flip-container').toggleClass('wdgtz_hover');
  }

  toggleMoreFewerOptions(event){
    event.preventDefault()
    $(event.currentTarget.parentElement).toggleClass('wdgtz_expanded')
    this.content.find('.wdgtz_action').toggleClass('wdgtz_expanded')
  }

  setStayingDestination(value){
    this.state.stayingDestination = value
    this.content.find('input.wdgtz_full-address').val(value)
    this.content.find('span.wdgtz_full-address').text(value)
  }

  setDates(event, calendar){
    let range = calendar.instance.getRange()
        
    if (range.start){
      this.state.checkIn = moment(range.start)
    }
    if (range.end){
      this.state.checkOut = moment(range.end)
    }
  }

  updateCalendar(event, calendar) {
    // put it at the bottomo of the control triggering the opening
    let el$ = $(event.currentTarget)
    let offset = el$.offset()
    this.content.find('.comiseo-daterangepicker.ui-widget').css('top', offset.top + el$.height())
    this.content.find('.comiseo-daterangepicker.ui-widget').css('left', offset.left)

    let eventStart = this.state.eventStart
    let eventEnd = this.state.eventEnd

    if (eventStart){
      $.each($(`.comiseo-daterangepicker .comiseo-daterangepicker-calendar .ui-datepicker-calendar td[data-month=${eventStart.month()}][data-year=${eventStart.year()}]`), function(index, td){
        let el$ = $(td)
        let dayOfMonth = parseInt(el$.find('a').text())
        if (!isNaN(dayOfMonth) && dayOfMonth === eventStart.date()){
          el$.addClass('event-start')
        }
      })
    }

    if (eventEnd){
      $.each($(`.comiseo-daterangepicker .comiseo-daterangepicker-calendar .ui-datepicker-calendar td[data-month=${eventEnd.month()}][data-year=${eventEnd.year()}]`), function(index, td){
        let el$ = $(td)
        let dayOfMonth = parseInt(el$.find('a').text())
        if (!isNaN(dayOfMonth) && dayOfMonth === eventEnd.date()){
          el$.addClass('event-end')
        } else if (eventStart && eventStart < eventEnd && dayOfMonth > eventStart.date() && dayOfMonth < eventEnd.date()){
          el$.addClass('event-date')
        }
      })
    }

    let range = calendar.instance.getRange()

    if (!!range && range.start){
      let start = moment(range.start)
      $.each($(`.comiseo-daterangepicker .comiseo-daterangepicker-calendar .ui-datepicker-calendar td[data-month=${start.month()}][data-year=${start.year()}]`), function(index, td){
        let el$ = $(td)
        let dayOfMonth = parseInt(el$.find('a').text())
        if (!isNaN(dayOfMonth) && dayOfMonth === start.date()){
          el$.addClass('start-range')
        }
      })
    }
    if (!!range && range.end){
      let end = moment(range.end)

      $.each($(`.comiseo-daterangepicker .comiseo-daterangepicker-calendar .ui-datepicker-calendar td[data-month=${end.month()}][data-year=${end.year()}]`), function(index, td){
        let el$ = $(td)
        let dayOfMonth = parseInt(el$.find('a').text())
        if (!isNaN(dayOfMonth) && dayOfMonth === end.date()){
          el$.addClass('end-range')
        }
      })
    }
  }

  setGuests(value){
    if (!isNaN(value)){
      this.state.defaultGuests = value
    }
  }

  setRooms(value){
    if (!isNaN(value)){
      this.state.defaultRooms = value
    }
  }

  setHotelChain(value){
    this.state.hotelChain = value
  }

  setHotelRating(value){
    if (!isNaN(value)){
      this.state.hotelRating = value
    }
  }

  doSearch(event){
    event.preventDefault()
    event.stopPropagation()

    let rooms = this.state.defaultRooms
    let guests = this.state.defaultGuests
    let checkIn = this.state.checkIn.format('MM/DD/YYYY')
    let checkOut = this.state.checkOut.format('MM/DD/YYYY')
    let hotelChain = this.state.hotelChain || ''
    let hotelRating = this.state.hotelRating || ''
    let latitude = this.state.latitude
    let longitude = this.state.longitude
    let currency = this.state.currency
    let poiName = encodeURIComponent(this.state.poiName) //encodeURIComponent
    let refClickId = this.state.refClickId ? encodeURIComponent(this.state.refClickId) : '' // encodeURIComponent
    let refId = this.state.refId
    let refClickId2 = this.state.refClickId2 ? encodeURIComponent(this.state.refClickId2) : ''
    let stayingDestination = encodeURIComponent(this.state.stayingDestination)

    let searchUrl = `${this.state.cname}/hotels/results/?check_in=${checkIn}&check_out=${checkOut}` +
      `&refid=${refId}&refclickid=${refClickId}refclickid2=${refClickId2}` +
      `&rooms=${rooms}&guests=${guests}&chain_id=${hotelChain}&star_rating=${hotelRating.join(',')}` +
      `&poi_name=${poiName}&latitude=${latitude}&longitude=${longitude}&currency=${currency}`      

    if (rooms === 5){
      searchUrl = `https://tripplanz.groupize.com/search?` + 
      `search%5Bcheck_in%5D=${this.state.checkIn.format('YYYY-MM-DD')}&` +
      `search%5Bcheck_out%5D=${this.state.checkOut.format('YYYY-MM-DD')}&` + 
      `search%5Bentry_point%5D=umbrella&` +
      `search%5Bevent_duration%5D=${this.state.checkOut.diff(this.state.checkIn, 'days')}&` +
      `search%5Bfunction_date%5D=&search%5Blocation%5D=${stayingDestination}&` +
      `search%5Bmaximum_adults_per_room%5D=2&search%5Bmeeting_space%5D=false&` +
      `search%5Bnumber_of_attendees%5D=&search%5Bpeople%5D=${guests}&` + 
      `search%5Brooms%5D=5&search%5Bsleeping_rooms%5D=true`
    } 
    
     window.open(searchUrl, "_blank")
  }
}