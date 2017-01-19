import './widget.less'
import { Observable } from './observable'
import $ from 'jquery'
// import 'jquery-ui/ui/widget'
// import 'jquery-ui/ui/widgets/button'
// import 'jquery-ui/ui/widgets/datepicker'
// import 'jquery-ui/ui/widgets/menu'
// import 'jquery-ui/themes/base/base.css'
// import Moment from 'moment'
import Mustache from 'mustache'
// import 'imports-loader?jQuery=jquery,moment=moment,this=>window!./jquery.comiseo.daterangepicker.js'
// import 'style-loader?css-loader!./jquery.comiseo.daterangepicker.css'
import 'imports-loader?this=>window!./selector-queries.js'
import { stayingView } from './stayingView'
import { drivingView } from './drivingView'
import { flyingView } from './flyingView'

export class WidgetZ extends Observable {
  constructor(params) {
    super()
    this.init()
    this.views = []
    this.params = params
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
        let selector = $(li)
        let key = selector.data('key')
        let content = $(`.wdgtz_content > *[data-content=${selector.data('key')}]`)
        switch(key){
          case 'staying':
            this.views.push(new stayingView(this, selector, content))
            break
          case 'driving':
            this.views.push(new drivingView(this, selector, content))
            break
          case 'flying':
            this.views.push(new flyingView(this, selector, content))
            break
          default:
            throw error(`Undefined view ${key}`)
        }
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


      
    })
  }

  setView(view){
    this.views.filter(vw => {
      return vw !== view
    }).forEach(vw => {
      vw.hide()
    })

    view.show()
  }
}