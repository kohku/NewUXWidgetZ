import { WidgetZ } from './widgetz'

export function main(params){

  //  Check: compatibility
  if (!Array.isArray(params)){
    throw error('Invalid WidgetZVars')
  }

  let linkUrl = params.find(param => param.key === 'wdgt_link_url')

  if (typeof linkUrl === 'undefined'){
    params.push({ key: 'wdgt_link_url', value: global.wdgt_link_URL || null })
  }

  let pictureUrl = params.find(param => param.key === 'wdgt_imaage_url')

  if (typeof pictureUrl === 'undefined'){
    params.push({ key: 'wdgt_imaage_url', value: global.wdgt_image_URL || null })
  }

  let widget = new WidgetZ(params)
}

main(widgetZVars || {});
