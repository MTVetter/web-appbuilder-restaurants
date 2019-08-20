///////////////////////////////////////////////////////////////////////////
// Copyright © 2016 Robert Scheitlin. All Rights Reserved.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'jimu/BaseWidget',
    'jimu/WidgetManager'
  ],
  function(
    declare,
    lang,
    BaseWidget,
    WidgetManager) {
    var clazz = declare([BaseWidget], {

      name: 'introJS',
      baseClass: 'widget-introJS',
      isOpening: false,

      onOpen: function(){
        if(!this.isOpening){
          this.isOpening = true;
          initIntro();
          setTimeout(lang.hitch(this, function(){
            this.isOpening = false;
            WidgetManager.getInstance().closeWidget(this);
          }), 300);
        }
      }
    });
    return clazz;
  });
