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
      this.yelp = new Yelp(this.config.apiKey, this.config.apiSearchUrl);
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
      // this._graphicsLayer.add(graphic);
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

      // this._getYelp(x,y);
    }

    //Create a function to get the Yelp businesses
    // _getYelp: function(x,y){
    //   this.map.graphics.clear();

    //   //add a graphic for the searched address
    //   var searchMarker = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 5, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([200,26,26])), new Color([200,26,26]));
    //   var searchPoint = new esri.geometry.Point({"x":y, "y":x, "spatialReference":{wkid:4326}});
    //   var searchGraphic = new esri.Graphic(searchPoint, searchMarker);
    //   this.map.graphics.add(searchGraphic);

    //   //Create a feature collection which will form the new feature layer
    //   var featureCollection ={
    //     "layerDefinition": null,
    //     "featureSet": {
    //       "features": [],
    //       "geometryType": "esriGeometryPoint"
    //     }
    //   };
    //   featureCollection.layerDefinition = {
    //     "geometryType": "esriGeometryPoint",
    //     "drawingInfo": {
    //       "renderer": {
    //         "type": "simple",
    //         "symbol": {
    //           "color": [210,105,30,191],
    //           "size": 8,
    //           "type": "esriSMS",
    //           "style": "esriSMSCircle",
    //           "outline": {
    //             "color": [0,0,128,255],
    //             "width": 0,
    //             "type": "esriSLS",
    //             "style": "esriSLSSolid"
    //           }
    //         }
    //       }
    //     },
    //     "fields": [{
    //       "name": "ObjectID",
    //       "alias": "ObjectID",
    //       "type": "esriFieldTypeOID"
    //     },{
    //       "name": "Name",
    //       "alias": "Name",
    //       "type": "esriFieldTypeString"
    //     },{
    //       "name": "Price",
    //       "alias": "Price",
    //       "type": "esriFieldTypeString"
    //     },{
    //       "name": "Rating",
    //       "alias": "Rating",
    //       "type": "esriFieldTypeString"
    //     },{
    //       "name": "FoodType",
    //       "alias": "Type of Food",
    //       "type": "esriFieldTypeString"
    //     }, {
    //       "name": "Address",
    //       "alias": "Restaurant Address",
    //       "type": "esriFieldTypeString"
    //     },{
    //       "name": "Distance",
    //       "alias": "Distance from Searched Address (in Miles)",
    //       "type": "esriFieldTypeSmallInteger"
    //     }]
    //   };

    //   //Address that the user searched
    //   var address = document.getElementById("esri_dijit_Search_1_input").value;

    //   //Create a popup template for the feature layer
    //   var infoTemplateQuery = new InfoTemplate("Restaurants Near Searched Address","Restaurant Name: ${Name}<br/>Address: ${Address}<br/>Type of Food: ${FoodType}<br/>Price: ${Price}<br/>Rating: ${Rating}<br/>Distance from Searched Address: ${Distance}");

    //   //Create the feature layer with the address in the title
    //   this.featureLayer = new FeatureLayer(featureCollection, {
    //     id: "Restaurants near " + address,
    //     infoTemplate: infoTemplateQuery
    //   });

    //   //Get the distance the user wants
    //   if (document.getElementById("one").checked = true){
    //     var food = esriRequest({
    //       url: "http://api.yelp.com/v3/businesses/search",
    //       content: {
    //         f: "json",
    //         latitude: x,
    //         longitude: y,
    //         radius: 1610,
    //         // sort_by: "rating",
    //         categories: "restaurants, All",
    //         limit: 50
    //       },
    //       handleAs: "json",
    //       headers: {
    //         "Authorization": "Bearer JAonzvDvhi6PPEDnasZivP49GngU4D5UXjQcnfVDzMiO99BInmBYCA84DVYbWdDF0syzwr2sEhceCOhFJN5Extj0cGvZwu-3WNpZh_GOd-TmPBz5NxE57ECyzw8YXHYx"
    //       }
    //     },{
    //       usePost: false
    //     });
    //   } else if (document.getElementById("three").checked = true){
    //     var food = esriRequest({
    //       url: "http://api.yelp.com/v3/businesses/search",
    //       content: {
    //         f: "json",
    //         latitude: x,
    //         longitude: y,
    //         radius: 4828,
    //         // sort_by: "distance",
    //         categories: "restaurants, All",
    //         limit: 50
    //       },
    //       handleAs: "json",
    //       headers: {
    //         "Authorization": "Bearer JAonzvDvhi6PPEDnasZivP49GngU4D5UXjQcnfVDzMiO99BInmBYCA84DVYbWdDF0syzwr2sEhceCOhFJN5Extj0cGvZwu-3WNpZh_GOd-TmPBz5NxE57ECyzw8YXHYx"
    //       }
    //     },{
    //       usePost: false
    //     });
    //   } else if (document.getElementById("five").checked = true){
    //     var food = esriRequest({
    //       url: "http://api.yelp.com/v3/businesses/search",
    //       content: {
    //         f: "json",
    //         latitude: x,
    //         longitude: y,
    //         radius: 8046.72,
    //         // sort_by: "rating",
    //         categories: "restaurants, All",
    //         limit: 50
    //       },
    //       handleAs: "json",
    //       headers: {
    //         "Authorization": "Bearer JAonzvDvhi6PPEDnasZivP49GngU4D5UXjQcnfVDzMiO99BInmBYCA84DVYbWdDF0syzwr2sEhceCOhFJN5Extj0cGvZwu-3WNpZh_GOd-TmPBz5NxE57ECyzw8YXHYx"
    //       }
    //     },{
    //       usePost: false
    //     });
    //   } else if (document.getElementById("ten").checked = true){
    //     var food = esriRequest({
    //       url: "http://api.yelp.com/v3/businesses/search",
    //       content: {
    //         f: "json",
    //         latitude: x,
    //         longitude: y,
    //         radius: 16093,
    //         // sort_by: "rating",
    //         categories: "restaurants, All",
    //         limit: 50
    //       },
    //       handleAs: "json",
    //       headers: {
    //         "Authorization": "Bearer JAonzvDvhi6PPEDnasZivP49GngU4D5UXjQcnfVDzMiO99BInmBYCA84DVYbWdDF0syzwr2sEhceCOhFJN5Extj0cGvZwu-3WNpZh_GOd-TmPBz5NxE57ECyzw8YXHYx"
    //       }
    //     },{
    //       usePost: false
    //     });
    //   } else if (document.getElementById("fifteen").checked = true){
    //     var food = esriRequest({
    //       url: "http://api.yelp.com/v3/businesses/search",
    //       content: {
    //         f: "json",
    //         latitude: x,
    //         longitude: y,
    //         radius: 24140,
    //         // sort_by: "rating",
    //         categories: "restaurants, All",
    //         limit: 50
    //       },
    //       handleAs: "json",
    //       headers: {
    //         "Authorization": "Bearer JAonzvDvhi6PPEDnasZivP49GngU4D5UXjQcnfVDzMiO99BInmBYCA84DVYbWdDF0syzwr2sEhceCOhFJN5Extj0cGvZwu-3WNpZh_GOd-TmPBz5NxE57ECyzw8YXHYx"
    //       }
    //     },{
    //       usePost: false
    //     });
    //   } else if (document.getElementById("twenty").checked = true){
    //     var food = esriRequest({
    //       url: "http://api.yelp.com/v3/businesses/search",
    //       content: {
    //         f: "json",
    //         latitude: x,
    //         longitude: y,
    //         radius: 32187,
    //         // sort_by: "rating",
    //         categories: "restaurants, All",
    //         limit: 50
    //       },
    //       handleAs: "json",
    //       headers: {
    //         "Authorization": "Bearer JAonzvDvhi6PPEDnasZivP49GngU4D5UXjQcnfVDzMiO99BInmBYCA84DVYbWdDF0syzwr2sEhceCOhFJN5Extj0cGvZwu-3WNpZh_GOd-TmPBz5NxE57ECyzw8YXHYx"
    //       }
    //     },{
    //       usePost: false
    //     });
    //   }

    //   // //Use the Yelp API to find restaurants within a mile of the searched address
    //   // var food = esriRequest({
    //   //   url: "http://api.yelp.com/v3/businesses/search",
    //   //   content: {
    //   //     f: "json",
    //   //     latitude: x,
    //   //     longitude: y,
    //   //     radius: 1610,
    //   //     sort_by: "rating",
    //   //     categories: "restaurants, All"
    //   //   },
    //   //   handleAs: "json",
    //   //   headers: {
    //   //     "Authorization": "Bearer JAonzvDvhi6PPEDnasZivP49GngU4D5UXjQcnfVDzMiO99BInmBYCA84DVYbWdDF0syzwr2sEhceCOhFJN5Extj0cGvZwu-3WNpZh_GOd-TmPBz5NxE57ECyzw8YXHYx"
    //   //   }
    //   // },{
    //   //   usePost: false
    //   // });

    //   food.then(lang.hitch(this, function(response){
    //     console.log(response);
    //     var i;

    //     //Loop through all the results and add them to the feature layer
    //     for (i = 0; i < response.businesses.length; i++){

    //       //Setting up the attributes from the results
    //       var oid = i;
    //       var name = response.businesses[""+[i]+""].name;
    //       var price = response.businesses[""+[i]+""].price;
    //       var rating = response.businesses[""+[i]+""].rating;
    //       var x1 = response.businesses[""+[i]+""].coordinates.longitude;
    //       var y1 = response.businesses[""+[i]+""].coordinates.latitude;
    //       var foodType = response.businesses[""+[i]+""].categories["0"].title;
    //       var address = response.businesses[""+[i]+""].location.display_address["0"];
    //       var distance = ((response.businesses[""+[i]+""].distance) / 1609.34).toFixed(2);


    //       //Create the point from the x,y coordinates from the results
    //       var pt = new esri.geometry.Point({"x":x1, "y":y1, "spatialReference":{wkid:4326}});
    //       //Add attributes to the point
    //       var attr = {"ObjectID":oid, "Name":name, "Price":price, "Rating":rating, "FoodType":foodType, "Address":address, "Distance":distance};
    //       var infoTemplate = new InfoTemplate("Restaurants Near Searched Address","Restaurant Name: ${Name}<br/>Price: ${Price}<br/>Rating: ${Rating}");
    //       //Create a graphic from the point
    //       var graphic = new esri.Graphic(pt);
    //       //Add attributes to the graphic
    //       graphic.setAttributes(attr);
    //       // this.map.graphics.add(graphic);
    //       //Add the graphic to the feature layer
    //       this.featureLayer.add(graphic);
    //     }
    //     //Add the feature layer to the map once the loop is complete
    //     this.map.addLayer(this.featureLayer);
    //   }), function(error){
    //     console.log(error);
    //   });
    // }
    
  });
});