import './widget.less'
import { Observable } from './observable'
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
import 'imports-loader?this=>window!./selector-queries.js'


export class WidgetZ extends Observable {
  constructor() {
    super()
    console.log('Inside constructor')
    this.init()
    this.views = []
  }

  init(){
    if (window.squery){
      window.squery.run()
    }

    // loading widget
    $.get('widget.htm', template => {
      let rendered = Mustache.render(template, {})
      $('#graphical-wdgtz-container').html(rendered)

      if (window.squery){
          window.squery.refresh()
      }

      // loading tabs and setting up listeners
      $.each($('ul.wdgtz_tabs > li'), (index, li) => {
        let el$ = $(li)
        let view = {
          selector: el$, 
          content: $(`.wdgtz_content > *[data-content=${el$.data('key')}]`)
        }
        // setup listener for clicks
        el$.on('click', () => {
          this.setView.call(this, view)
        })
        // pushing the view
        this.views.push(view)
      })

      // set initial view
      if (this.views.length > 0){
        this.setView(this.views[0])
      }

      // load guest options

      // load room options

      // load hotel chains

      // load hotel raitings

      // enable toggle in search options

      // enable picture flipping

      // set search url

      // live cycle


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

  setView(view){
    const activeCss = 'wdgtz_active'
    this.views.forEach(item => {
      if (item !== view){
        if (item.selector.hasClass(activeCss)){
          item.selector.removeClass(activeCss)
        }
        if (item.content.hasClass(activeCss)){
          item.content.removeClass(activeCss)
        }
      }
    })

    if (!view.selector.hasClass(activeCss)){
      view.selector.addClass(activeCss)
    }
    if (!view.content.hasClass(activeCss)){
      view.content.addClass(activeCss)
    }
  }
}