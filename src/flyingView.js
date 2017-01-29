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
  }

  setListeners() {
    // More/fewer options listeners
    this.content.find('.wdgtz_options label').on('click', event => this.toggleMoreFewerOptions(event))
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
}