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

export class stayingView extends baseView{
  constructor(widget, selector, content){
    super(widget, selector, content)
  }

  initialize(){
    const service = new WidgetService()

    let pictureUrl = this.widget.params.find(p => p.key === 'wdgt_imaage_url')
    if (pictureUrl){
      $.each(this.content.find('.wdgtz_front .wdgtz_canvas'), (index, canvas) => {
        let canva$ = $(canvas)
        canva$.css('background-image', `url(${pictureUrl.value})`)
        canva$.html(canva$.html().replace('Picture', ''))
      })
    }

    // TODO: get location somewhere
    let location = null
    if (location){
      $.each(this.content.find('.wdgtz_back .wdgtz_canvas'), (index, canvas) => {
        let canva$ = $(canvas)
        canva$.css('background-image', `url(${location})`)
        canva$.html(canva$.html().replace('Map', ''))
      })
    }

    // Set calendar range
    let checkInDateOrDays = this.widget.params.find(p => p.key === 'check_in')
    let checkIn = moment()
    // is a number, calculate from now
    if (Number.isInteger(checkInDateOrDays.value)){
      checkIn.add(parseInt(checkInDateOrDays.value), 'days')
    // is moment?
    } else if (checkInDateOrDays.value instanceof moment){
      checkIn = checkInDateOrDays.value
    // is date string 'YYYY-MM-DD' ISO 8601 or a Date
    } else {
      checkIn = moment(checkInDateOrDays.value)
    }

    let checkOutDateOrDays = this.widget.params.find(p => p.key === 'check_out')

    let checkOut = moment()
    // is a number, calculate from now
    if (Number.isInteger(checkOutDateOrDays.value)){
      checkOut.add(parseInt(checkOutDateOrDays.value), 'days')
    // is moment?
    } else if (checkOutDateOrDays.value instanceof moment){
      checkOut = checkOutDateOrDays.value
    // is date string 'YYYY-MM-DD' ISO 8601 or a Date
    } else {
      checkOut = moment(checkOutDateOrDays.value)
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
    rangePicker.daterangepicker("setRange", { start: checkIn.toDate(), end: checkOut.toDate() });

    // load guest
    let defaultGuests = this.widget.params.find(p => p.key === 'guests')
    if (defaultGuests){
      $.each(this.content.find('.wdgtz_guest'), (index, guests) => {
        $(guests).val(defaultGuests.value || 1)
      })
    }

    // load rooms
    let defaultRooms = this.widget.params.find(p => p.key === 'rooms')
    if (defaultRooms){
      $.each(this.content.find('.wdgtz_rooms'), (index, rooms) => {
        $(rooms).val(defaultRooms.value || 1)
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
    let param = this.widget.params.find(p => p.key === 'hotel_stars')
    let stars = typeof param !== 'undefined' ? param.value.split(',').map(key => parseInt(key)) : []

    service.getHotelRaiting().then(all => {
      let ratings = all.filter(rating => stars.indexOf(rating.key) >= 0)

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
    

    // TODO: We'll move this to mustache to save some code
    let widgetUrl = this.widget.params.find(p => p.key === 'wdgt_link_url')
    if (widgetUrl){
      this.content.find('.wdgtz_front .wdgtz_canvas').on('click', event => {
        window.open(widgetUrl.value, '_blank');
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

    this.content.find('.wdgtz_action button').on('click', event => {
      // TODO: do search 
      console.log('Searching')
      // window.open(url, '_blank')
    })
  }
}