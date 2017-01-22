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
    GoogleMapsLoader.onLoad(google => this.loadMap(google))
  }

  initialize(){
    const service = new WidgetService()

    if (this.state.pictureUrl){
      $.each(this.content.find('.wdgtz_front .wdgtz_canvas'), (index, canvas) => {
        let canva$ = $(canvas)
        canva$.css('background-image', `url(${this.state.pictureUrl})`)
        canva$.html(canva$.html().replace('Picture', ''))
      })
    }

    // Loading maps
    GoogleMapsLoader.load()

    let location = null
    if (location){
      $.each(this.content.find('.wdgtz_back .wdgtz_canvas'), (index, canvas) => {
        let canva$ = $(canvas)
        canva$.css('background-image', `url(${location})`)
        canva$.html(canva$.html().replace('Map', ''))
      })
    }

    let rangePicker = this.content.find('input[name="daterange"]')
    rangePicker.daterangepicker({
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
    rangePicker.daterangepicker("setRange", {
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
    // TODO: Setup listeners for edit
    this.content.find('.wdgtz_edit').on('click', event => {
      let address = $('.wdgtz_address1, .wdgtz_city, .wdgtz_state-province, .wdgtz_zip, .wdgtz_country, .wdgtz_full-address')
      $.each(address, (index, element) => {
        $(element).toggleClass('editable')
      })
    })

    // Widget Url
    if (this.state.widgetUrl){
      this.content.find('.wdgtz_front .wdgtz_canvas').on('click', event => {
        window.open(this.state.widgetUrl, '_blank');
      })
    }

    // Flip for map picture
    this.content.find('.wdgtz_flip').on('click', event => {
        event.preventDefault()
        event.stopPropagation()
        $('.wdgtz_flip-container').toggleClass('wdgtz_hover');
    })

    // More/fewer options listeners
    this.content.find('.wdgtz_details .wdgtz_options label').on('click', event => {
      event.preventDefault()
      $(event.currentTarget.parentElement).toggleClass('wdgtz_expanded')
      this.content.find('.wdgtz_action').toggleClass('wdgtz_expanded')
    })

    // Search
    this.content.find('.wdgtz_action button').on('click', event => {
      // TODO: do search 
      console.log('Searching')
      // window.open(url, '_blank')
    })
  }

  loadMap(google){
    console.log('I just loaded google maps api')
    const map = new google.maps.Map(document.getElementById('wdgtz_hotel-map'), { zoom: 8 })
    const geocoder = new google.maps.Geocoder()
    let address = `${this.state.address || ''} ${this.state.city || ''} ${this.state.stateProvince || ''} ${this.state.postalCode || ''} ${this.state.country || ''}`
    // looking for latitude and longitude values
    geocoder.geocode({'address': address}, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location)
        var marker = new google.maps.Marker({ map: map, position: results[0].geometry.location })
        marker.setMap(map)
        map.setCenter(results[0].geometry.location)
        var newlatLng = results[0].geometry.location.toString()
        newlatLng = newlatLng.replace("(","")
        newlatLng = newlatLng.replace(")","")
        newlatLng = newlatLng.replace(" ","")
        newlatLng = newlatLng.split(',')
        this.state.latitude = newlatLng[0]
        this.state.longitude = newlatLng[1]
      } else {
        throw Error(status)
      }
    })
  }
}