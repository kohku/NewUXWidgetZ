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

  initialize(){
    const service = new WidgetService()

    this.content.find('.wdgtz_starting-airport').autocomplete({
      source: (request, response) => {
        service.getAirOriginDestination(request.term).then(suggestions => {
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
        this.state.flyingFromType = ui.item.type 
        this.state.flyingFrom = ui.item.key 
      },
    })

    this.content.find('.wdgtz_flying-to input.wdgtz_full-address').autocomplete({
      source: (request, response) => {
        service.getAirOriginDestination(request.term).then(suggestions => {
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
      minLength: 1,
      select: (event, ui) => {
        this.state.flyingToType = ui.item.type 
        this.state.flyingTo = ui.item.key
        let flyingDestination = this.state.flyingDestination
        this.setFlyingDestination(ui.item.value)
        if (flyingDestination !== this.state.flyingDestination){
          this.content.find('.wdgtz_flying-to').addClass('edited')
        }

        if (flyingDestination !== this.state.flyingDestination){
          this.content.find('.wdgtz_flying-to').addClass('edited')
        }
        this.toggleEditAddress()
      },
    })


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
    this.content.find('.wdgtz_traveler').on('change', event => this.setTravelers(event.target.value))

    // More/fewer options listeners
    this.content.find('.wdgtz_options label').on('click', event => this.toggleMoreFewerOptions(event))
    // Search
    this.content.find('.wdgtz_action').on('click', event => this.doSearch(event))
  }

  toggleEditAddress(){
    this.content.find('.wdgtz_flying-to').toggleClass('editable')
  }

  setFlyingDestination(value){
    this.state.flyingDestination = value
    this.content.find('input.wdgtz_full-address').val(value)
    this.content.find('span.wdgtz_full-address').text(value)
  }

  setTravelers(value){
    this.state.travelers = value
  }

  setDates(event, calendar){
    let range = calendar.instance.getRange()
        
    if (range.start){
      this.state.departure = moment(range.start)
    }
    if (range.end){
      this.state.returnDate = moment(range.end)
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

    let flyingFromAirport = this.state.flyingFromType === 'AIR' ? this.state.flyingFrom : '' 
    let flyingFromCity = this.state.flyingFromType === 'CITY' ? this.state.flyingFrom : ''
    let flyingToAirport = this.state.flyingToType === 'AIR' ? this.state.flyingTo : ''
    let flyingToCity = this.state.flyingToType === 'CITY' ? this.state.flyingTo : ''

    let travelers = this.state.travelers || 1
    let departure = this.state.departure.format('MM/DD/YYYY')
    let returnDate = this.state.returnDate.format('MM/DD/YYYY')
    let airVendor = this.state.airVendor || ''
    let seatClass = this.state.seatClass || ''
    let stops = ''
    let latitude = this.state.latitude
    let longitude = this.state.longitude
    let currency = this.state.currency
    let poiName = encodeURIComponent(this.state.poiName) //encodeURIComponent
    let refClickId = this.state.refClickId ? encodeURIComponent(this.state.refClickId) : '' // encodeURIComponent
    let refId = this.state.refId
    let refClickId2 = this.state.refClickId2 ? encodeURIComponent(this.state.refClickId2) : ''

    let searchUrl = `${this.state.cname}/flights/search/?rs_adults=${travelers}` +
      `&rs_o_aircode=${flyingFromAirport}&rs_o_city=${flyingFromAirport}` +
      `&rs_d_aircode=${flyingToAirport}&rs_d_city=${flyingToAirport}` + 
      `&rs_chk_in=${departure}&rs_chk_out=${returnDate}` +
      `&preferred_airline=${airVendor}&cabin_class=${seatClass}&preferred_stops=${stops}` +
      `&currency=${currency}&poi_name=${poiName}` +
      `&refclickid=${refClickId}&refid=${refId}&refclickid2=${refClickId2}`

     window.open(searchUrl, "_blank")
  }
}