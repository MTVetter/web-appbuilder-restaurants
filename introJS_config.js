//Function to help you get the element name
function getNode(node){
    return document.querySelector(node);
}

//Function that sets up the introJS window
//Steps is the amount of help that the user is get
//Intro is just the text that the user will read in order to get a better understanding of what something does
//Element is the DOM element that the popup window will zoom to. Elements are usually classes or ids
//Position is where the popup will display. You can change the setting based on where the window is opening. Acceptable values are: left, right, top, bottom, auto
function initIntro(){
    introJs().setOptions({
        steps: [{
				//initial step
				//Displays in the center of the screen since there isn't an element associated with it.
				intro: "Welcome to the <b>Updated Demographic Data Explorer</b> application! <br><br>This help you understand what the different buttons do."
			},
			{
				//Example element is for the zoom in and out buttons
				element: ".jimu-widget-zoomslider",
				intro: "You can zoom in or out with these buttons, or you can use the mouse wheel.",
				//Put the window on the right since the zoom in and out buttons are on the left most side of the screen
				position: "right"
			},
			{
				element: ".jimu-widget-homebutton",
				intro: "You can go to the initial extent of the map with this button",
				position: "right"
			},
			{
				element: ".jimu-widget-mylocation",
				intro: "This button uses your device's GPS to display your location on the map. Requires additional user permission.",
				position: "right"
			},
			{
				element: ".search-bar",
				intro: "The search bar allows you to serach for any address and will zoom to that location.",
				position: "bottom"
			},
			{
				element: getNode("#dijit__WidgetBase_3"),
				intro: "The Basemap Gallery allows you to change the type of basemap used in the application.",
				position: "bottom"
			},
			{
				element: getNode("#dijit__WidgetBase_2"),
				intro: "The Measurement widget allows you to measure distances on the map.",
				position: "bottom"
			},
			{
				element: getNode("#dijit__WidgetBase_1"),
				intro: "The Print widget allows you to create a downloadable file of the map that you can print.",
				position: "bottom"
			},
			{
				element: ".esriOverviewMap",
				intro: "The overview map can give you perspective of the area compared to the rest of Texas.",
				position: "left"
			},
            {
				//Example of how to use the getNode function
                element:  getNode('#uniqName_13_0'),
                intro: "The Legend widget shows you how the graphic representation of each layer in the map",
                position: 'top'
			},
			{
				element: getNode("#uniqName_13_1"),
				intro: "The Layer List widget allows you to turn on or off any layer within the map.",
				position: "top"
			},
			{
				element: getNode("#uniqName_13_2"),
				intro: "The Query widget allows you query a layer based on an attribute.",
				position: "top"
			}
        ]
    }).start();
}