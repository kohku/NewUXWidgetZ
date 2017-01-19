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

    this.content.find('input[name="daterange"]').daterangepicker({
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
            // onChangeMonthYear: function(year, month, instance){
            //     debugger;
            // },
            // onSelect: function(dateText, instance){
            //     debugger;
            // }
        },
        open: (event, calendar) => {
            // put it at the bottomo of the control triggering the opening
            var el$ = $(event.currentTarget)
            var offset = el$.offset()
            this.content.find('.comiseo-daterangepicker.ui-widget').css('top', offset.top + el$.height())
            this.content.find('.comiseo-daterangepicker.ui-widget').css('left', offset.left)

            // window.daterangepicker = calendar.instance
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
                // TODO: Set event range background
            }
        },
    })

    // load guest
    $.each(this.content.find('.wdgtz_guest'), (index, guest) => {

    })

    // load rooms
    $.each(this.content.find('.wdgtz_rooms'), (index, rooms) => {

    })

    // load hotel chain
    $.each(this.content.find('.wdgtz_hotel-chain'), (index, chain) => {

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
    // Flip for map picture
    $.each(this.content.find('.wdgtz_flip'), (index, btn) => {
      $(btn).on('click', () => {
        $('.wdgtz_flip-container').toggleClass('wdgtz_hover');
      })
    })

    // More/fewer options listeners
    this.content.find('.wdgtz_details .wdgtz_options label').on('click', event => {
      event.preventDefault()
      $(event.currentTarget.parentElement).toggleClass('wdgtz_expanded')
      this.content.find('.wdgtz_action').toggleClass('wdgtz_expanded')
    })
  }
}