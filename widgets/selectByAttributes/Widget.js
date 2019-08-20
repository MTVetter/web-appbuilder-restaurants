define([//Dojo
        'dojo/_base/declare', 
        'dojo/_base/lang',
        'dojo/_base/array',
        'dojo/dom-construct',
        'dojo/dom-style', 
        'dojo/Deferred',
        'dojo/dom',
        //Jimu
        'jimu/BaseWidget',
        'jimu/dijit/LoadingShelter',
        'jimu/SelectionManager',
        'jimu/dijit/Message',
        //Dijit
        'dijit/form/Select',
        'dijit/form/Button',
        'dijit/form/TextBox',
        'dijit/form/MultiSelect',
        'dijit/ConfirmDialog',
        //Custom classes
        './idWebMapLayers',
        //Esri
        'esri/tasks/query', 
        'esri/tasks/QueryTask',
        'esri/request',
        'esri/layers/FeatureLayer',
        'esri/symbols/SimpleFillSymbol',
        'esri/symbols/SimpleLineSymbol', 
        'esri/symbols/SimpleMarkerSymbol',
        'esri/Color', 
        'esri/renderers/SimpleRenderer',
        'esri/geometry/Extent',
        //Files
        'xstyle/css!./files/bootstrap.min.css',
        './files/jquery-3.3.1.min',
        './files/bootstrap.min',
        //domReady!
        'dojo/domReady!'
        ],
function(declare, lang, array, domConstruct, domStyle, Deferred, dom,
         BaseWidget, LoadingShelter, SelectionManager, Message,
         Select, Button, TextBox, MultiSelect, ConfirmDialog,
         idWebMapLayers,
         Query, QueryTask, esriRequest, FeatureLayer, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, Color, SimpleRenderer, Extent) {

  return declare([BaseWidget], {

    shelter: null,
    layerName: null,
    layer: null,
    field: null,
    url: null,
    uniqueValue: null,
    ese: null,
    selectedField: null,
    selectionManager: SelectionManager.getInstance(),
    thelayer: null,
    theName: null,

    startup: function(){
      this.inherited(arguments);
      this._setWidgetSize();
      this._initLoadingShelter();
      this._initLayerChooser();
      this._initButtons();
    },

    onOpen: function(){
      var panel = this.getPanel();
      panel.position.height = 650;
      panel.position.width = 600;
      panel.setPosition(panel.position);
      panel.panelManager.normalizePanel(panel);
    },

    _setWidgetSize: function(){
      var panel = this.getPanel();
          panel.position.height = 650;
          panel.position.width = 500;
          panel.setPosition(panel.position);
          panel.panelManager.normalizePanel(panel);
    },

    _initLoadingShelter: function(){
      this.shelter = new LoadingShelter({
        hidden: false
      });
      this.shelter.placeAt(this.loadingNode);
      this.shelter.startup();
      this.shelter.hide();
    },

    _initLayerChooser: function(){
      var idForChangeEvent = "layerChooserNodeEvent" 

      new idWebMapLayers({
        idForChangeEvent: idForChangeEvent,
        layerNode: "layerChooserNode",
        map: this.map,
        geometry: "*", //options: 'point', 'polygon', 'line', 'multiPatch' or '*'
        imageFolderUrl: this.folderUrl
      }) 

      this.layerName = dijit.byId(idForChangeEvent).value
      this._fieldMultiSelect(this.layerName)  
      this.selectFrom.innerHTML = 'SELECT * FROM ' + this.layerName  + ' WHERE:'
   
      dijit.byId(idForChangeEvent).on("change", lang.hitch(this, function(evt){
        this._updateFieldMultiSelect('fieldsMultiSelect', evt) 
        this.selectFrom.innerHTML = 'SELECT * FROM ' + evt + ' WHERE:'
      }))
    },

    _fieldMultiSelect: function(layerId){
      this.layer = this.map.getLayer(layerId) 
      this.url = this.layer.url 
      var fields = this.layer.fields 
      this.field = this.layer.fields

      for(i in fields){
        var opData = domConstruct.create('option')
            opData.innerHTML = fields[i].name
            opData.value = fields[i].name
        dom.byId('fieldsMultiSelect').appendChild(opData)
      }

      var self = this;
      $('#fieldsMultiSelect').on('change', function(){
        self.selectedField = $(this).val();
        $('#textBoxNode').val( $('#textBoxNode').val() + $(this).val() );
        
        var $uniques = $('#uniquesMultiSelect' + ' option');
        $.each($uniques, function(index, element) {
          element.remove();
        });
      });

      $('#uniquesMultiSelect').on('change', function(){
        $('#textBoxNode').val( $('#textBoxNode').val() + "'" + $(this).val() + "'" );
      });
    },

    _updateFieldMultiSelect: function(id, layerId){
      var $uniques = $('#' + id + ' option');
       $.each($uniques, function(index, element) {
        element.remove();
      });

      this.layer = this.map.getLayer(layerId) 
      this.url = this.layer.url 
      var fields = this.layer.fields 
      this.field = this.layer.fields

      for(i in fields){
        var opData = domConstruct.create('option')
            opData.innerHTML = fields[i].name
            opData.value = fields[i].name
        dom.byId(id).appendChild(opData)
      }
    },

    _initButtons: function(){
      for(i in this.config.ids){
        new Button({
          label: this.nls.buttons[this.config.ids[i]],
          value: this.nls.buttons[this.config.ids[i]],
          class: "button",
          onClick: function(){
            $('#textBoxNode').val( $('#textBoxNode').val() + ' ' + this.get("value") + ' ' );
          }
        }, this[this.config.ids[i]]);
      }
    },

    _getUniqueValues: function(){
      this.shelter.show();
      var query = new Query()
          query.where = '1=1';
          query.outFields = this.selectedField;
          new QueryTask(this.url).execute(query, lang.hitch(this, function(results){
            var map = results.features.map(lang.hitch(this, function(record){
              return record.attributes[this.selectedField[0]]
            }))
            var def = new Deferred()
                def.resolve(map);
                def.then(lang.hitch(this, function(results){
                  return results.sort()
                    .filter(lang.hitch(this, function(x, i){
                      return results.indexOf(x) === i; 
                    }))
                })).then(lang.hitch(this, function(results){
                  var $uniques = $('#uniquesMultiSelect option');
                  $.each($uniques, function(index, element){
                    element.remove();
                  });
                  return results
                })).then(lang.hitch(this, function(results){
                  this._updateUniquesMultiselect('uniquesMultiSelect', results)
                })).then(lang.hitch(this, function(results){
                  this.shelter.hide();
                }))
          }))
    },

    _updateUniquesMultiselect: function(id, data){
      for(i in data){
        var opData = domConstruct.create('option')
            opData.innerHTML = data[i]
            opData.value = data[i]
        dom.byId(id).appendChild(opData)
      }
    },

    _performQuery: function(){
      var idForChangeEvent = "layerChooserNodeEvent";
      this.layerName = dijit.byId(idForChangeEvent).value;
      console.log(this.layerName);
      var query = new Query()
          query.where = $('#textBoxNode').val();
          query.outFields = ["*"];
          query.returnGeometry = true;
          query.outSpatialReference = this.map.spatialReference;
          new QueryTask(this.url).execute(query, lang.hitch(this, this.showResults
            // console.log(results.features);
            // this.selectionManager.setSelection(this.layer, results.features);
          ),function(error){
            new Message({
              message: "There was a problem selecting."
            });
          });
    },

    _confirmQuery: function(){
      var query = new Query()
          query.where = $('#textBoxNode').val();
          query.outFields = ["*"];
          new QueryTask(this.url).execute(query, lang.hitch(this, function(results){
            if(results.features.length != 0){
              new Message({
                message: "There expression was successfully verified."
              });
            }else{
              new Message({
                message: "The expression was verified successfully, but no records were returned."
              });
            }
          }),function(error){
            new Message({
              message: "There was an error with the expression."
            });
          });
    },

    _clearSelection: function(){
      //When the user clicks the Clear button remove the query and turn off the results
      $('#textBoxNode').val('');
      try{
        this.thelayer.hide();
      }
      catch(err){
        console.log("The query layer hasn't been added yet.")
      }
    },

    //Create a function to zoom the map to the query results
    //Borrowed from the Enhanced Query widget
    calcGraphicsExtent: function (graphicsArray) {
      var g = graphicsArray[0].geometry,
        fullExt = g.getExtent(),
        ext, i, il = graphicsArray.length;

      if (fullExt === null) {
        fullExt = new Extent(g.x, g.y, g.x, g.y, g.spatialReference);
      }
      for (i = 1; i < il; i++) {
        ext = (g = graphicsArray[i].geometry).getExtent();
        if (ext === null) {
          ext = new Extent(g.x, g.y, g.x, g.y, g.spatialReference);
        }
        fullExt = fullExt.union(ext);
      }
      return fullExt;
    },

    //Create a new feature layer from the query
    //Borrowed from the Enhanced Query widget
    showResults: function (featureSet){
      //Assign the featureSet to a single variable
      var resultFeatures = featureSet.features;
      console.info(resultFeatures[0]);
      //If resultFeatures has a length of 0 alert the user that no results were found
      if (resultFeatures.length === 0){
        alert('No results found.');
      } else {
        //Set the extent of the map using the function we created earlier
        var extent = this.calcGraphicsExtent(resultFeatures);
        this.map.setExtent(extent);

        //Get the type of geometry of the results
        var geometryTypeQuery = featureSet.geometryType;

        //Set the symbology of the results based on the type of geometry
        var markerSymbolQuery = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 11,
          new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color([255,0,0]), 1),
          new Color([111,211,55,1]));

        var lineSymbolQuery = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH,
          new Color([255,0,0]), 3);

        var polygonSymbolQuery = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color([222,0,0]), 1), new Color([255,255,0]));

        //Check to determine which symbology to use
        var symbolQuery;
        switch (geometryTypeQuery){
          case "esriGeometryPoint":
            symbolQuery = markerSymbolQuery;
            break;
          case "esriGeometryPolyline":
            symbolQuery = lineSymbolQuery;
            break;
          case "esriGeometryPolygon":
            symbolQuery = polygonSymbolQuery;
            break;
          default:
            symbolQuery = polygonSymbolQuery;
        }

        //Create the feature collection which will be used as the shell for the feature layer
        var featureCollection = {
          "layerDefinition": null,
          "featureSet": {
            "features":[],
            "geometryType": geometryTypeQuery
          }
        };

        //Give the feature layer "properties" which are based on the results
        featureCollection.layerDefinition = {
          "geometryType": geometryTypeQuery,
          "drawingInfo": {
            "renderer": {
              "type": "simple",
              "symbol": symbolQuery.toJson()
            }
          },
          "fields": featureSet.fields
        };

        //Create the new feature layer and name it based on the query and add it to the map
        this.thelayer = new FeatureLayer(featureCollection,{
          id: this.layerName + " Where: " +$('#textBoxNode').val()
        });
        this.map.addLayer(this.thelayer);

        //Loop through all the results and add it to the feature layer
        for (var i = 0; i < resultFeatures.length; i++){
          var feature = resultFeatures[i];
          feature.setSymbol(symbolQuery);
          this.thelayer.add(feature);
        }
        this._openResultInAttributeTable(this.thelayer);
      }
    },

    //Add the newly created feature layer to the attribute table
    //Borrowed from the Enhanced Query widget
    _openResultInAttributeTable: function (currentLayer) {
      if (this.autozoomtoresults) {
        setTimeout(lang.hitch(this, function () {
          this.zoomall();
        }), 300);
      }
      var aLayer = {
        layerObject: currentLayer,
        title: currentLayer.name,
        id: currentLayer.id,
        getLayerObject: function () {
          var def = new Deferred();
          if (this.layerObject) {
            def.resolve(this.layerObject);
          } else {
            def.reject("layerObject is null");
          }
          return def;
        }
      };
      if (!Object.create) {
        Object.create = function (proto, props) {
          if (typeof props !== "undefined") {
            throw "The multiple-argument version of Object.create is not provided by this browser and cannot be shimmed.";
          }
          function ctor() {}
          ctor.prototype = proto;
          return new ctor();
        };
      }
      this.publishData({
        'target': 'AttributeTable',
        'layer': Object.create(aLayer)
      });
    }
  });
});
