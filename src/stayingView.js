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

    GoogleMapsLoader.onLoad(google => this.getGeoMap(google))
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
        change: (event, calendar) => {
          let range = calendar.instance.getRange()
          this.setDates(moment(range.start), moment(range.end))
        },
        open: (event, calendar) => {
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
        },
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
    this.content.find('.wdgtz_edit').on('click', event => this.toggleEditAddress(event))
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

    // Search
    this.content.find('.wdgtz_action button').on('click', event => this.doSearch(event))
  }

  getGeoMap(google){
    let options = { zoom: 8}
    if (!this.state.latitude && !this.state.longitude){
      options.lat = this.state.latitude
      options.lng = this.state.longitude
    }
    const map = new google.maps.Map(document.getElementById('wdgtz_hotel-map'), options)
    const geocoder = new google.maps.Geocoder()
    let address = `${this.state.address || ''} ${this.state.city || ''} ${this.state.stateProvince || ''} ${this.state.postalCode || ''} ${this.state.country || ''}`
    // get map
    geocoder.geocode({'address': address}, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        this.state.formatAddress = results[0].formatted_address
        map.setCenter(results[0].geometry.location)
        var marker = new google.maps.Marker({ map: map, position: results[0].geometry.location })
        marker.setMap(map)
        map.setCenter(results[0].geometry.location)
        if (!this.state.latitude && !this.state.longitude){
          this.state.latitude = results[0].geometry.location.lat()
          this.state.longitude = results[0].geometry.location.lng()
        }
      } else {
        console.log(status)
      }
    })
  }

  toggleEditAddress(event){
    let address = $('.wdgtz_address1, .wdgtz_city, .wdgtz_state-province, .wdgtz_zip, .wdgtz_country, .wdgtz_full-address')
    $.each(address, (index, element) => {
      $(element).toggleClass('editable')
    })
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

  setDates(start, end){
    if (start instanceof moment){
      this.state.checkIn = start
    }
    if (end instanceof moment){
      this.state.checkOut = end
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

    let searchUrl = `${this.state.cname}/hotels/results/?rooms=${rooms}&guests=${guests}` +
      `&check_in=${checkIn}&check_out=${checkOut}&chain_id=${hotelChain}&star_rating=${hotelRating}` +
      `&latitude=${latitude}&longitude=${longitude}&currency=${currency}&poi_name=${poiName}` +
      `&refclickid=${refClickId}&refid=${refId}&refclickid2=${refClickId2}`

    if (guests === 5){
      window.open("https://tripplanz.groupize.com/", "_blank")
      return
    } 
    
     window.open(searchUrl, "_blank")
  }
}