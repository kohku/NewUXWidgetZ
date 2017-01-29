import { baseView } from './baseView'
import $ from 'jquery'
import 'jquery-ui/ui/widget'
import 'jquery-ui/ui/widgets/button'
import 'jquery-ui/ui/widgets/datepicker'
import 'jquery-ui/ui/widgets/menu'
import 'jquery-ui/themes/base/base.css'
import Moment from 'moment'
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
      this.getGeoMap(this.state.fullAddress).then(response => {
        this.updateMapAddress(response)
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

    this.rangePicker = this.content.find('input[name="daterange"]')
    this.rangePicker.daterangepicker({
        presetRanges: [],
        initialText: 'SELECT TRAVEL DATES',
        autoFitCalendars: true,
        applyButtonText: 'Done',
        clearButtonText: 'Select dates',
        icon: '',
        applyOnMenuSelect: false,
        dateFormat: 'dMy',
        datepickerOptions : {
            numberOfMonths : 1,
            minDate: 0,
            maxDate: null,
            dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        },
        // change: (event, calendar) => this.setDates(event,calendar),
        // open: (event, calendar) => this.updateCalendar(event, calendar),
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
    service.getHotelChains().then(all => {
      $.each(this.content.find('.wdgtz_hotel-chain'), (index, element) => {
        all.forEach(chain => {
          $(element).append(`<option value="${chain.key}">${chain.value}</option>`)
        })
      })
    })

    // load hotel raiting
    service.getHotelRaiting().then(all => {
      let ratings = all.filter(rating => this.state.hotelStars.indexOf(rating.key) >= 0)

      $.each(this.content.find('.wdgtz_hotel-rating'), (index, element) => {
        ratings.forEach(rating => {
          $(element).append(`<option value="${rating.key}">${rating.value}</option>`)
        })
      })
    })
  }

  setListeners(){
    // Setup listeners for edit
    this.content.find('.wdgtz_edit').on('click', event => this.toggleEditAddress())
    // Widget Url
    if (this.state.widgetUrl){
      this.content.find('.wdgtz_front .wdgtz_canvas').on('click', event => this.openWidgetUrl(event))
    }
    // Flip for map picture
    this.content.find('.wdgtz_flip').on('click', event => this.flipMapPicture(event))
    // More/fewer options listeners
    this.content.find('.wdgtz_details .wdgtz_options label').on('click', event => this.toggleMoreFewerOptions(event))
    // form elements
    this.content.find('.wdgtz_guest').on('change', (event) => this.setGuests(parseInt(event.currentTarget.value)))
    this.content.find('.wdgtz_rooms').on('change', (event) => this.setRooms(parseInt(event.currentTarget.value)))
    this.content.find('.wdgtz_guest').on('change', (event) => this.setHotelChain(parseInt(event.currentTarget.value)))
    this.content.find('.wdgtz_rooms').on('change', (event) => this.setHotelRating(parseInt(event.currentTarget.value)))
    this.content.find('.wdgtz_full-address').on('blur keyup', (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.type === 'blur'){
        // removing the editable class on enter triggers a blur event
        if ($('.wdgtz_header').hasClass('editable')){
          this.toggleEditAddress()
        }
        if (this.state.fullAddress !== event.currentTarget.value){
          // this.setFullAddress()
          this.getGeoMap(event.currentTarget.value).then(response => {
            let fullAddress = this.state.fullAddress
            this.updateMapAddress(response)
            if (fullAddress !== this.state.fullAddress){
              this.content.find('.wdgtz_header').addClass('edited')
            }
          })
        }
      } 

      if (event.keyCode == 13) {
        // removing the editable class on enter triggers a blur event
        this.toggleEditAddress()
        if (this.state.fullAddress !== event.currentTarget.value){
          // this.setFullAddress(event.currentTarget.value)
          this.getGeoMap(event.currentTarget.value).then(response => {
            let fullAddress = this.state.fullAddress
            this.updateMapAddress(response)
            if (fullAddress !== this.state.fullAddress){
              this.content.find('.wdgtz_header').addClass('edited')
            }
          })
        }
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

  updateMapAddress(response){
    this.state.formatAddress = response[0].formatted_address
    this.setFullAddress(this.state.formatAddress)

    if (!this.state.latitude && !this.state.longitude){
      this.state.latitude = response[0].geometry.location.lat()
      this.state.longitude = response[0].geometry.location.lng()
    }

    let options = { zoom: 8}
    const map = new google.maps.Map(document.getElementById('wdgtz_hotel-map'), options)
    map.setCenter(response[0].geometry.location)
    var marker = new google.maps.Marker({ map: map, position: response[0].geometry.location })
    marker.setMap(map)
    map.setCenter(response[0].geometry.location)
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

  setFullAddress(value){
    this.state.fullAddress = value
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
    var el$ = $(event.currentTarget)
    var offset = el$.offset()
    this.content.find('.comiseo-daterangepicker.ui-widget').css('top', offset.top + el$.height())
    this.content.find('.comiseo-daterangepicker.ui-widget').css('left', offset.left)

    var range = calendar.instance.getRange()

    if (range !== null){
      if (range.start){
          var start = moment(range.start)
          $.each(this.content.find('td[data-month='+start.month()+'][data-year='+start.year()+']'), function(index, td){
              var el$ = $(td)
              if (el$.find('a').text() == start.date()){
                  el$.addClass('start-date')
              }
          })
      }
      if (range.end){
          var end = moment(range.end)
          $.each(this.content.find('td[data-month='+end.month()+'][data-year='+end.year()+']'), function(index, td){
              var el$ = $(td)
              if (el$.find('a').text() == end.date()){
                  el$.addClass('end-date')
              }
          })
      }
    }
  }

  setGuests(value){
    this.state.defaultGuests = isNaN(value) ? null : value
  }

  setRooms(value){
    this.state.defaultRooms = isNaN(value) ? null : value
  }

  setHotelChain(value){
    this.state.hotelChain = isNaN(value) ? null : value
  }

  setHotelRating(value){
    this.state.hotelRating = isNaN(value) ? null : value
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
    let fullAddress = encodeURIComponent(this.state.fullAddress)

    let searchUrl = `${this.state.cname}/hotels/results/?rooms=${rooms}&guests=${guests}` +
      `&check_in=${checkIn}&check_out=${checkOut}&chain_id=${hotelChain}&star_rating=${hotelRating}` +
      `&latitude=${latitude}&longitude=${longitude}&currency=${currency}&poi_name=${poiName}` +
      `&refclickid=${refClickId}&refid=${refId}&refclickid2=${refClickId2}`

    if (rooms === 5){
      searchUrl = `https://tripplanz.groupize.com/search?` + 
      `search%5Bcheck_in%5D=${this.state.checkIn.format('YYYY-MM-DD')}&` +
      `search%5Bcheck_out%5D=${this.state.checkOut.format('YYYY-MM-DD')}&` + 
      `search%5Bentry_point%5D=umbrella&` +
      `search%5Bevent_duration%5D=${this.state.checkOut.diff(this.state.checkIn, 'days')}&` +
      `search%5Bfunction_date%5D=&search%5Blocation%5D=${fullAddress}&` +
      `search%5Bmaximum_adults_per_room%5D=2&search%5Bmeeting_space%5D=false&` +
      `search%5Bnumber_of_attendees%5D=&search%5Bpeople%5D=${guests}&` + 
      `search%5Brooms%5D=5&search%5Bsleeping_rooms%5D=true`
    } 
    
     window.open(searchUrl, "_blank")
  }
}