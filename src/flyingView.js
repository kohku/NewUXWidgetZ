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

export class flyingView extends baseView {
  constructor(widget, state, selector, content){
    super(widget, state, selector, content)
  }

  /*
  TODO LIST

  From and to airport code/city

  Preferred airline
  Preferred seat class

  Search

  */

  initialize(){
    const service = new WidgetService()

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
        change: (event, calendar) => this.setDates(event, calendar),
        open: (event, calendar) => this.updateCalendar(event, calendar),
    })
    this.rangePicker.daterangepicker("setRange", {
       start: this.state.departure.toDate(), 
       end: this.state.returnDate.toDate() 
    })

    $.each($('.wdgtz_airline'), (index, element) => {
      service.getAirVendors().then(all => {
        all.forEach(vendor => {
          $(element).append(`<option value="${vendor.Code}">${vendor.Name}</option>`)
        })
      })
    })
 }

  setListeners() {
    // Setup listeners for edit
    this.content.find('.wdgtz_edit').on('click', event => {
      this.toggleEditAddress()
      this.content.find('input.wdgtz_full-address').focus()
    })
    // More/fewer options listeners
    this.content.find('.wdgtz_options label').on('click', event => this.toggleMoreFewerOptions(event))
    this.content.find('.wdgtz_flying-to input.wdgtz_full-address').on('blur keyup', (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.type === 'blur' && this.content.find('.wdgtz_flying-to').hasClass('editable')){
        // removing the editable class on enter triggers a blur event
        if (this.state.fullAddress !== event.currentTarget.value){
          this.getGeoMap(event.currentTarget.value).then(response => {
            let fullAddress = this.state.fullAddress
            this.state.formatAddress = response[0].formatted_address
            this.setFullAddress(this.state.formatAddress)
            if (fullAddress !== this.state.fullAddress){
              this.content.find('.wdgtz_flying-to').addClass('edited')
            }

            if (fullAddress !== this.state.fullAddress){
              this.content.find('.wdgtz_flying-to').addClass('edited')
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
              this.content.find('.wdgtz_flying-to').addClass('edited')
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

  toggleEditAddress(){
    this.content.find('.wdgtz_flying-to').toggleClass('editable')
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

    if (!!range && range.start){
      var start = moment(range.start)
      $.each(this.content.find('td[data-month='+start.month()+'][data-year='+start.year()+']'), function(index, td){
          var el$ = $(td)
          if (el$.find('a').text() == start.date()){
              el$.addClass('start-date')
          }
      })
    }
    if (!!range && range.end){
      var end = moment(range.end)
      $.each(this.content.find('td[data-month='+end.month()+'][data-year='+end.year()+']'), function(index, td){
          var el$ = $(td)
          if (el$.find('a').text() == end.date()){
              el$.addClass('end-date')
          }
      })
    }
  }

  toggleMoreFewerOptions(event){
    event.preventDefault()
    $(event.currentTarget.parentElement).toggleClass('wdgtz_expanded')
    this.content.find('.wdgtz_action').toggleClass('wdgtz_expanded')
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