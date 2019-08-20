define(['dojo/_base/declare',
  'jimu/BaseWidget',
  'esri/dijit/Search',
  'esri/request',
  'dojo/on',
  'dojo/dom-construct',
  "esri/config",
  "esri/geometry/Point",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/Color",
  "esri/graphic",
  "esri/layers/GraphicsLayer",
  "esri/SpatialReference",
  "dojo/_base/lang",
  "esri/InfoTemplate",
  "esri/layers/FeatureLayer",
  "esri/InfoTemplate",
  "./yelp",
  "dojo/domReady!"
],
function(declare, BaseWidget, Search, esriRequest, on, domConstruct, esriConfig, Point, SimpleMarkerSymbol, SimpleLineSymbol, Color, Graphic, GraphicsLayer, SpatialReference, lang, InfoTemplate, FeatureLayer, InfoTemplate, Yelp) {
  return declare([BaseWidget], {

    baseClass: "find-restaurants",
    _graphicsLayer: null,
    featureLayer: null,

    postCreate: function(){
      this.inherited(arguments);
      this.createSearchWidget();
      this.yelp = new Yelp(this.config.apiKey);
    },

    onOpen: function(){
      var panel = this.getPanel();
      panel.position.height = 500;
      panel.position.width = 400;
      panel.setPosition(panel.position);
      panel.panelManager.normalizePanel(panel);
    },

    _initLayers: function(){
      this._graphicsLayer = new GraphicsLayer();
      this.map.addLayer(_graphicsLayer);
    },

    //Create the search widget
    createSearchWidget: function(){
      this.search = new Search({
        map: this.map,
        autoNavigate: true
      }, this.searchWidgetWrapper);
      this.search.startup();

      //Take point location to search other layers
      on(this.search, "select-result", function(evt){
        this.showResultsForPoint(evt.result.feature.geometry);
      }.bind(this));
    },

    //Create a function for the search result
    showResultsForPoint: function(point){
      var x = point.getLatitude();
      var y = point.getLongitude();

      this.yelp.getLocations(x,y, this.map);

    }
    
  });
});