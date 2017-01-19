import './widget.less'
import { WidgetZ } from './widgetz'
import $ from 'jquery'
import 'jquery-ui/ui/widget'
import 'jquery-ui/ui/widgets/button'
import 'jquery-ui/ui/widgets/datepicker'
import 'jquery-ui/ui/widgets/menu'
import 'jquery-ui/themes/base/base.css'
import Moment from 'moment'
import Mustache from 'mustache'
import 'imports-loader?jQuery=jquery,moment=moment,this=>window!./jquery.comiseo.daterangepicker.js'
import 'style-loader?css-loader!./jquery.comiseo.daterangepicker.css'

export function main(params){

  console.log(JSON.stringify(params))

  let widget = new WidgetZ()

  if (window.__responsive){
    window.__responsive.run()
  }

  $.get('widget.htm', template => {
    let rendered = Mustache.render(template, {})
    $('#graphical-wdgtz-container').html(rendered)

    window.__responsive.refresh()

    $.each($('.wdgtz_flip'), function(index, btn){
        $(btn).on('click', function(){
            $('.wdgtz_flip-container').toggleClass('wdgtz_hover');
        })
    })

    $('.wdgtz_hotel .wdgtz_details .wdgtz_options label').on('click', function(event){
        event.preventDefault()
        $(event.currentTarget.parentElement).toggleClass('wdgtz_expanded')

        $('.wdgtz_hotel .wdgtz_action').toggleClass('wdgtz_expanded')
    })

    var dp = $('input[name="daterange"]').daterangepicker({
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
        open: function(event, calendar){
            // put it at the bottomo of the control triggering the opening
            var el$ = $(event.currentTarget)
            var offset = el$.offset()
            $('.comiseo-daterangepicker.ui-widget').css('top', offset.top + el$.height())
            $('.comiseo-daterangepicker.ui-widget').css('left', offset.left)

            // window.daterangepicker = calendar.instance
            var range = calendar.instance.getRange()

            if (range !== null){
                if (range.start){
                    var start = moment(range.start)
                    $.each($('td[data-month='+start.month()+'][data-year='+start.year()+']'), function(index, td){
                        var el$ = $(td)
                        if (el$.find('a').text() == start.date()){
                            el$.addClass('start-date')
                        }
                    })
                }
                if (range.end){
                    var end = moment(range.end)
                    $.each($('td[data-month='+end.month()+'][data-year='+end.year()+']'), function(index, td){
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
  })
}

main();
