define([
  'dojo/_base/declare',
  "jimu/BaseWidget",
  'esri/request',
  "esri/InfoTemplate",
  "esri/layers/FeatureLayer",
  "esri/InfoTemplate",
  "esri/config",
  "esri/geometry/Point",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/PictureMarkerSymbol",
  "esri/Color",
  "esri/graphic",
  "esri/layers/GraphicsLayer",
  "esri/SpatialReference",
  "dojo/_base/lang",
],
function(
  declare, BaseWidget, esriRequest, InfoTemplate, FeatureLayer, InfoTemplate, esriConfig, Point, SimpleMarkerSymbol, SimpleLineSymbol, PictureMarkerSymbol, Color, Graphic, GraphicsLayer, SpatialReference, lang
) {
  return declare([BaseWidget], {
    apiKey: '',
    apiSearchUrl:'',

    constructor: function(apiKey, apiSearchUrl) {
      // We must pass an API key into the constructor or things will not work at all:
      if(apiKey) {
        this.apiKey = apiKey;
      } else {
        console.error('Error getting API key.');
      }

      if (apiSearchUrl){
        this.apiSearchUrl = apiSearchUrl;
        esriConfig.defaults.io.corsEnabledServers.push(apiSearchUrl);
      } else {
        console.log(apiSearchUrl);
        console.error("Error getting search url.");
      }
    },

    /**
     * Given a point (x/y), return nearest restaurants sorted by distance.
     * @param {number} x - the x attiribute of the lat/long
     * @param {number} y - the y attribute of the lat/long
     * @returns {promise} returns a promise that will resolve to the results.
     */
    getLocations(x, y, map) {

      //Create a feature collection which will form the new feature layer
      var featureCollection ={
        "layerDefinition": null,
        "featureSet": {
          "features": [],
          "geometryType": "esriGeometryPoint"
        }
      };
      featureCollection.layerDefinition = {
        "geometryType": "esriGeometryPoint",
        "drawingInfo": {
          "renderer":{
            "type": "simple",
            "symbol":{
              "type": "esriPMS",
              "url": "https://www.aiga.org/globalassets/symbol-signs/28_restaurant_inv.gif",
              "contentType": "image/png",
              "width": 15,
              "height": 15
            }
          }
        },
        "fields": [{
          "name": "ObjectID",
          "alias": "ObjectID",
          "type": "esriFieldTypeOID"
        },{
          "name": "Name",
          "alias": "Name",
          "type": "esriFieldTypeString"
        },{
          "name": "Price",
          "alias": "Price",
          "type": "esriFieldTypeString"
        },{
          "name": "Rating",
          "alias": "Rating",
          "type": "esriFieldTypeString"
        },{
          "name": "FoodType",
          "alias": "Type of Food",
          "type": "esriFieldTypeString"
        }, {
          "name": "Address",
          "alias": "Restaurant Address",
          "type": "esriFieldTypeString"
        },{
          "name": "Distance",
          "alias": "Distance from Searched Address (in Miles)",
          "type": "esriFieldTypeSmallInteger"
        }]
      };

      //Address that the user searched
      var address = document.getElementById("esri_dijit_Search_1_input").value;

      //Create a popup template for the feature layer
      var infoTemplateQuery = new InfoTemplate("Restaurants Near Searched Address","Restaurant Name: ${Name}<br/>Address: ${Address}<br/>Type of Food: ${FoodType}<br/>Price: ${Price}<br/>Rating: ${Rating}<br/>Distance from Searched Address: ${Distance}");

      //Create the feature layer with the address in the title
      this.featureLayer = new FeatureLayer(featureCollection, {
        id: "Restaurants near " + address,
        infoTemplate: infoTemplateQuery
      });

      //Get the distance the user wants
      var food = esriRequest({
        url: this.apiSearchUrl,
        content: {
          f: "json",
          latitude: x,
          longitude: y,
          radius: 4828,
          sort_by: "rating",
          categories: "restaurants, All",
          limit: 50
        },
        handleAs: "json",
        headers: {
          "Authorization": "Bearer " + this.apiKey
        }
      },{
        usePost: false
      }).then(lang.hitch(this, function(response){
        console.log("HEY");
        console.log(response);
        var i;

        //Loop through all the results and add them to the feature layer
        for (i = 0; i < response.businesses.length; i++){

          //Setting up the attributes from the results
          var oid = i;
          var name = response.businesses[""+[i]+""].name;
          var price = response.businesses[""+[i]+""].price;
          var rating = response.businesses[""+[i]+""].rating;
          var x1 = response.businesses[""+[i]+""].coordinates.longitude;
          var y1 = response.businesses[""+[i]+""].coordinates.latitude;
          var foodType = response.businesses[""+[i]+""].categories["0"].title;
          var address = response.businesses[""+[i]+""].location.display_address["0"];
          var distance = ((response.businesses[""+[i]+""].distance) / 1609.34).toFixed(2);


          //Create the point from the x,y coordinates from the results
          var pt = new esri.geometry.Point({"x":x1, "y":y1, "spatialReference":{wkid:4326}});
          //Add attributes to the point
          var attr = {"ObjectID":oid, "Name":name, "Price":price, "Rating":rating, "FoodType":foodType, "Address":address, "Distance":distance};
          var infoTemplate = new InfoTemplate("Restaurants Near Searched Address","Restaurant Name: ${Name}<br/>Price: ${Price}<br/>Rating: ${Rating}");
          //Create a graphic from the point
          var graphic = new esri.Graphic(pt);
          //Add attributes to the graphic
          graphic.setAttributes(attr);
          //Add the graphic to the feature layer
          this.featureLayer.add(graphic);
        }
        //Add the feature layer to the map once the loop is complete
        map.addLayer(this.featureLayer);
      }), function(error){
        console.log(error);
      });
    }

  });
});