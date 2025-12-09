/////////////////////////////////////////////////MAPPING TEEJOP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//This code was written beginning in the Summer of 2022, in a place known to the Ho-Chunk people as Teejop (four lakes).                                                                                  //
//The Ho-Chunk were forced to cede Teejop by an 1832 treaty as Euro-American settlers founded a city called Madison, Wisconsin.                                                                 //
//Over the following decades, the federal and state governments attemped an unsuccessful ethnic cleansing campaign against the Ho-Chunk, who struggled for decades to remain in their homelands.//
//This code was written by Gareth Baldrica-Franklin, a settler living in Teejop, with input from our project team, including Kasey Keeler, Sasha Suarez, Molli Pauliot, Sarah Tate, Jen Rose Smith, and Kendra Greendeer.                                                                                                             //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function(){
    //get active tour based on current url
    let tour = window.location.href.split('#')[1] ? window.location.href.split('#')[1] : "explore";
    //set map rotation based on selected tour.
    let rotation = tour == 'tour3' || tour == 'tour6' || tour == 'tour7' || tour == 'tour9' ? 0 : 90;
    //set default tour (tour 1), create empty variables for the map, route, site, and location layers
    let map, routeLayer, siteLayer, moundLayer, locationMarker, circle, currentStop = 1, tourTotal = 0, location = false;
    //colors
    let activeColor = "#000000", inactiveColor = "#999999";
    //typeface for background
    var typeface = 'karma';
    //close popup text
    let closePopup = "<p class='close-popup'>Tap map to close directions</p>";
    //function to create pronunciation listeners
    function pronounce(){
        document.querySelectorAll(".pronounce").forEach(function(elem){
            elem.addEventListener("click",function(){
                //create audio element
                let audio = document.createElement("audio"),
                    source = "<source src='audio/words/" + elem.innerHTML + ".mp3'>",
                    play = "<p class='play'>&#9654;</p>";
                //add source 
                audio.insertAdjacentHTML("beforeend",source)
                //insert audio element into document
                document.querySelector("body").append(audio);
                document.querySelector("body").insertAdjacentHTML("beforeend",play);
                //play audio
                audio.play();
                //add and position visual affordance
                let rect = elem.getBoundingClientRect(),
                    font = window.getComputedStyle(document.querySelector(".font-size"), null).getPropertyValue("font-size");
                document.querySelector(".play").style.top = rect.top - parseInt(font) + window.scrollX - 2 + "px";
                document.querySelector(".play").style.left = rect.left + window.scrollY + (rect.width/2) + "px";
                document.querySelector(".play").style.fontSize = font; 
                //remove audio after it finishes playing
                audio.onended = function(){
                    audio.remove();
                    document.querySelector(".play").remove();
                }
            })
        })
    }
    //stop menu
    function stopMenu(){
        //stops menu events
        //navigation bar stops menu
        document.querySelector(".stop").addEventListener("click",function(){
            if ( document.querySelector(".stops").style.display == "block"){
                document.querySelector(".stops").style.display = "none";
                document.querySelector(".stop").innerHTML = "Stops";

                //document.querySelector(".navbar-nav").style.top = (h - 140) + "px";
            }
            else{
                document.querySelector(".stops").style.display = "block";
                document.querySelector(".stop").innerHTML = "Close";
                //close menu on mobile
                let w = window.innerWidth;
                if (w <= 539){
                    document.querySelector(".navbar-nav").style.visibility = 'hidden';
                }
            }
        })
        //close stops menu when clicking elsewhere on the page
        document.querySelector("body").addEventListener("click",function(event){
            if (event.target.className != "stops" && event.target.className != "stop"){
                if (document.querySelector(".stops").style.display == "block"){
                    document.querySelector(".stops").style.display = "none";
                    document.querySelector(".stop").innerHTML = "Stops";
                }
            }
        })
    }
    //activate current tour
    function activateTour(){
        //add routes and sites
        addRoutes();
        addSiteData();
        //clear stop list
        document.querySelector(".stops").innerHTML = "";
    }
    //create the map
    function createMap(){
        //define map options
        let minZoom = 17,
            maxZoom = 18,
            bounds = ([
                [43.0402, -89.4942],
                [43.1511, -89.3077]
            ]);
        //populate map object
        map = L.map('map', {
            minZoom:minZoom,
            maxZoom:maxZoom,
            maxBounds:bounds,
            attributionControl: false,
            rotate:true,
            touchRotate:false,
            rotateControl: {
                closeOnZeroBearing: true
            }
        }).setView([43.075, -89.40], 16);
        //terrain tiles (not currently working)
        const p = new pmtiles.PMTiles('data/terrain.pmtiles');
        pmtiles.leafletRasterLayer(p).addTo(map)
        //add scale bar 
        L.control.scale({position:'bottomright'}).addTo(map);
        //add north indicator
        var northArrow = L.Control.extend({
            options:{
                position:"bottomright"
            },
            onAdd: function () {
                // create the control container with a particular class name
                var container = L.DomUtil.create('div', 'north-arrow');
                let arrow = rotation == 90 ? "&#8658;":"&#8657;";

                container.innerHTML = '<p>North ' + arrow + '</p>';
    
                return container;
            }
        });

        //remove link from close button from popups—inclusion of the link makes tour dissapear on reload
        map.on('popupopen', function() {
            document.querySelectorAll(".leaflet-popup-close-button").forEach(function(elem){
                elem.removeAttribute("href");
            });
        });

        map.addControl(new northArrow());
        //set intial map rotation        
        //map.compassBearing.enable();
        map.setBearing(rotation);

        createBackgroundTiles();

        //create location control
        var LocationControl = L.Control.extend({
            options:{
                position:"bottomleft"
            },
            onAdd: function () {
                // create the control container with a particular class name
                var container = L.DomUtil.create('div', 'location-control-container');
    
                container.innerHTML = '<p tabindex="0">Where am I?</p>';
    
                return container;
            }
        });

        map.addControl(new LocationControl());

        document.querySelector(".location-control-container").addEventListener("click",getLocation);
    }
    //function to create the map background
    function createBackgroundTiles(){

        class LakeSymbolizer{
            draw(context,geom,z,feature) {

                // Create a pattern for lake fill
                const patternCanvas = document.createElement("canvas");
                const patternContext = patternCanvas.getContext("2d");

                // Give the pattern a width and height
                patternCanvas.width = 10;
                patternCanvas.height = 10;

                // Give the pattern a background color
                patternContext.fillStyle = "#e1f4ff";
                patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
                //create diagonal line
                patternContext.beginPath();
                patternContext.moveTo(10, 10);
                patternContext.lineTo(0, 10);
                //color diagonal line
                patternContext.strokeStyle = "#b3e3ff";
                //draw diagonal line
                patternContext.stroke();

                const pattern = context.createPattern(patternCanvas, "repeat");
                context.fillStyle = pattern;

                context.strokeStyle = "#b3e3ff";
                context.lineWidth = 3;
                
                context.beginPath()
                
                for (var poly of geom) {
                    for (var p = 0; p < poly.length-1; p++) {
                        let pt = poly[p]
                        if (p == 0) context.moveTo(pt.x,pt.y)
                        else context.lineTo(pt.x,pt.y)
                    }
                }

                context.stroke()
                context.fill() 

            }
        }
        //styling for basemap elements
        let PAINT_RULES = [
            //styling for overall map background
            {
                dataLayer:"background",
                symbolizer:new protomapsL.PolygonSymbolizer({
                    fill:"rgba(219, 236, 212,0.7)",
                    opacity:1,
                    width:0
                })
            },
            //styling for green park areas
            {
                dataLayer:"green",
                symbolizer:new protomapsL.PolygonSymbolizer({
                    fill:"rgba(144, 176, 150,0.3)",
                    opacity:1,
                    width:0
                })
            },
            //styling for garden areas (such as longnecker horticultural garden or the allen centennial garden)
            {
                dataLayer:"garden",
                symbolizer:new protomapsL.PolygonSymbolizer({
                    fill:"rgba(144, 176, 130,0.3)",
                    opacity:1,
                    width:0
                })
            },
            //styling for buildings
            {
                dataLayer:"buildings",
                symbolizer:new protomapsL.PolygonSymbolizer({
                    fill:(z,f) => {
                        if (f.props.building == "university" || z >= 17)
                           return "rgba(255,255,255,0.5)";
                    },
                    stroke:(z,f) => {
                        if (f.props.building == "university" || z >= 17)
                           return "rgba(144, 154, 139,0.5)";
                    },
                    width:0.5
                })
            },
            //styling for walking paths
            {
                dataLayer:"paths",
                symbolizer:new protomapsL.LineSymbolizer({
                    dashColor:"white",
                    dashWidth:(z,f) => {
                        if (z == 17)
                           return 1
                        else if (z == 18)
                            return 2
                        else
                            return 0
                    },
                    dash:(z,f) => {
                        if (z == 17)
                           return [4, 4]
                        else if (z == 18)
                            return [7, 6]
                    }
                })
            },
            //styling for roads
            {
                dataLayer:"roads",
                symbolizer:new protomapsL.LineSymbolizer({
                    color:"white",
                    width:(z,f) => {
                        if (z <= 17)
                           return 2
                        else if (z == 18)
                            return 3
                        else
                            return 0
                    }
                })
            },
            //styling for lakes
            {
                dataLayer:"lakes_dissolved",
                symbolizer:new LakeSymbolizer()
            }  
        ];
        //styling function for adding rotatable point labels
        class PointLabelSymbolizer {
            place(layout,geom,feature) {
                let pt = geom[0][0]
                let name = feature.props.Name
        
                var font = "12px sans-serif", color = 'gray', lineHeight = 15

                //use different styles based on different basemaps
                if (feature.props.type == 'building'){
                    font = "bold 14px " + typeface
                    color = "#949494"
                }
                if (feature.props.type == 'natural') {
                    font = "bold italic 14px " + typeface
                    color = "#7c8c74"
                }
                if (feature.props.type == 'lake') {
                    font = "bold italic 16px " + typeface
                    color = "#6699cc"
                    lineHeight = 17
                }

                const lines = name.split(' ');

                layout.scratch.font = font
                let metrics = layout.scratch.measureText(name)
                let width = metrics.width + 10
                let ascent = metrics.actualBoundingBoxAscent
                let descent = metrics.actualBoundingBoxDescent
                let bbox = {minX:pt.x-width/2,minY:pt.y-ascent,maxX:pt.x+width/2,maxY:pt.y+descent}

                let draw = ctx => {
                    ctx.rotate(-rotation * Math.PI / 180);
                    ctx.font = font 
                    ctx.fillStyle = color
                    ctx.textAlign = "center";
                    //ctx.fillText(name,-width/2,0)
                    for (var i = 0; i<lines.length; i++)
                        ctx.fillText(lines[i], -(ctx.measureText(i).width)/2, i*lineHeight);
                }
                return [{anchor:pt,bboxes:[bbox],draw:draw}]
            }
        }
        //styling for label layers
        let LABEL_RULES = [
            //labels for points of interest
            {
                dataLayer:"labels",
                symbolizer:new PointLabelSymbolizer()
            },
            //labels for roads
            {
                dataLayer:"roads",
                symbolizer: new protomapsL.LineLabelSymbolizer({
                        labelProps:["NAME_O"],
                        font: "bold 14px " + typeface,
                        fill:"#b2b1b1",
                        stroke:"#ffffff",
                        width:1.5,
                        position:2,
                        repeatDistance:450,
                        rotation:rotation
                    })
            }
        ];

        let url = "data/merged.pmtiles";
        
        background = protomapsL.leafletLayer({
            url: url,
            paintRules:PAINT_RULES,
            labelRules:LABEL_RULES
        });
        
        background.addTo(map)

    }
    //function to add sites to the map
    function addSiteData(){
        let init; //get first site latlng

        if(siteLayer){
            map.removeLayer(siteLayer)
        }
        //activate layer if it doesn't already exist
        //get site data
        fetch('data/sites.geojson')
            .then(res => res.json())
            .then(data => {
                siteLayer = L.geoJson(data, {
                    filter:tourFeature,
                    style:siteStyle,
                    //style for point layers
                    pointToLayer:function(feature, latlng){
                        return L.circleMarker(latlng)
                    },
                    //set click listener
                    onEachFeature:function(feature, layer){
                        if (tour != "explore"){
                            tourTotal++;
                            if (feature.properties.pointOnTour == currentStop){
                                let coord = L.latLng(feature.geometry.coordinates[1],feature.geometry.coordinates[0]);
                                map.setView(coord, 18);
                            }
                        }
                        //open story when layer is selected
                        layer.on('click',function(){
                            //set selected stop to current stop
                            currentStop = feature.properties.pointOnTour;
                            createSiteStory(feature)
                        })
                    }
                }).addTo(map);
              
                //zoom to initial location and initial feature
                if (tour == "explore"){
                    map.fitBounds(siteLayer.getBounds(),{maxZoom:16})
                }
                else 
                    initialLocation(init);
            })

    }
    //site style function
    function siteStyle(feature){
        let coord = [feature.geometry.coordinates[1],feature.geometry.coordinates[0]];
        //site popup
        if (feature.properties.label && feature.properties.pointOnTour == currentStop && tour != "explore"){
            L.popup({className:"route-popup"}).setLatLng(coord).setContent(feature.properties.label + closePopup).openOn(map);
            //document.querySelector("#map-popup-content").innerHTML = feature.properties.label;
        }

        return {
            color:siteColor(feature.properties.pointOnTour),
            fillColor:siteFillColor(feature.properties.pointOnTour),
            fillOpacity:1,
            opacity:1,
            radius:13,
            weight:2
        }        
        //set current stop to purple, or all stops if exploration mode is active
        function siteFillColor(stop){
            if (stop == currentStop || tour == "explore"){
                return activeColor
            }
            else
                return inactiveColor
        }
        function siteColor(stop){
            if (stop == currentStop || tour == "explore")
                return inactiveColor
            else
                return activeColor
        }
    }
    //function to add the the route to the map
    function addRoutes(){
        //activate layer if it doesn't already exist
        if (routeLayer){
            map.removeLayer(routeLayer)
        }
        //get route data
        fetch("data/routes.geojson")
            .then(res => res.json())
            .then(data => {
                //only show route for tours, not exploration mode
                if (tour != "explore"){
                    routeLayer = L.geoJson(data, {
                        style:routeStyle,
                        filter:tourFeature,
                        pane:"tilePane"
                    }).addTo(map);
                }
            })
    }
    //route style
    function routeStyle(feature){
        let end = parseInt(feature.properties.end);

        return{
            color:routeColor(end),
            weight:6,
            dashArray:"4 12"
        }
        //set current and previous route to purple, and other routes to gray
        function routeColor(end){
            if (end <= currentStop){
                if (end == currentStop){
                    //zoom to current route
                    let coord = feature.geometry.coordinates,
                    bounds = [
                        [coord[0][1], coord[0][0]],
                        [coord[coord.length-1][1], coord[coord.length-1][0]]
                    ];

                    map.flyToBounds(bounds);
                    //route popup
                    let center = [coord[Math.round(coord.length/2)][1], coord[Math.round(coord.length/2)][0]]
                    if (feature.properties.label)
                        L.popup({className:"route-popup"}).setLatLng(center).setContent(feature.properties.label + closePopup).openOn(map);
                }
                
                return activeColor;
            }
            else{
                return inactiveColor
            }
        }
    }
    //load mound data
    function addMounds(){
        //get route data
        fetch("data/mounds.geojson")
            .then(res => res.json())
            .then(data => {
                moundLayer = L.geoJson(data, {
                    style:moundStyle,
                    pane:"tilePane"
                }).addTo(map);
            })
    }
    //mound style
    function moundStyle(feature){
        return{
            fillColor:"orange",
            fillOpacity:0.5,
            opacity:0
        }
    }
    //activate popups on initial location
    function initialLocation(init){
        //activate popup on location marker if location is activated
        if (locationMarker){
            locationMarker.togglePopup();
            /*map.fitBounds([
                locationMarker._latlng,
                init
            ])*/
        }

    }
    //filter visible features on the map based on the selected route
    function tourFeature(feature){
        if (feature.properties.tours == tour || tour == 'explore'){
            //add stops to the stop list menu
            if (feature.properties.name){
                let point = tour == "explore" ? "" : feature.properties.pointOnTour + ". ";
                //create new <a> element for the current stop on the tour
                let listStop = document.createElement("p")
                    listStop.innerHTML = point + feature.properties.name;
                    listStop.className = "list-stop";
                //add listener to jump to stop
                listStop.addEventListener("click",function(){
                    document.querySelector(".stops").style.display = "none";
                    document.querySelector(".stop").innerHTML = "Stops";
                    currentStop = feature.properties.pointOnTour;
                    createSiteStory(feature);
                })
                //add element to list
                document.querySelector(".stops").insertAdjacentElement("beforeend",listStop)
            }
            return true;
        }
    }
    //function that populates the story 
    function createSiteStory(feature){
        //access modal element and retrieve content
        let storyElem = document.getElementById('story-modal'),
            storyModal = new bootstrap.Modal(storyElem),
            storyContent = document.querySelector('#story-content'),
            storyAudio = feature.properties.audio,
            story = feature.properties.story,
            audioActive = false;   
        //clear story element content block
        storyContent.innerHTML = "";
        //update header
        document.querySelector('#story-title').innerHTML = feature.properties.name;
        //change next button text for last stop
        if (currentStop == tourTotal && tour != "explore")
            document.querySelector("#next-button").innerHTML = "Finish Tour"
        else    
            document.querySelector("#next-button").innerHTML = "Next"
        //hide back button if necessary
        if (currentStop == 1 || tour == "explore")
            document.querySelector("#back-button").style.visibility = "hidden";
        else
            document.querySelector("#back-button").style.visibility = "visible";
        
        //add content from site to content block
        story.forEach(function(block, i){
            //create story block div
            var div = document.createElement("div");
            div.id = "block-" + i;
            div.classList.add("story-block");
            //position story block if on desktop
            var position = "block-center";
            //add content blocks if they exist
            //title
            if (block.title){
                div.insertAdjacentHTML('beforeend', "<h1 class='" + position +"'>" + block.title + "</h1>")
            }
            //image
            if (block.image){
                //create div container to hold image and caption
                var imgDiv = document.createElement("div");
                imgDiv.classList.add(position,"img-block");
                imgDiv.insertAdjacentHTML('beforeend', '<img src="' + block.image + '" alt="' + block.alt + '">')
                //image caption
                if (block.caption)
                    imgDiv.insertAdjacentHTML('beforeend', "<p class='caption'>" + block.caption + "</p>")
                
                div.insertAdjacentElement('beforeend', imgDiv)
            }
            //video
            if (block.video){
                div.insertAdjacentHTML('beforeend', "<iframe class='" + position +"' src='" + block.video + "'></iframe>")
            }
            //paragraph
            if (block.content){
                div.insertAdjacentHTML('beforeend', "<p class='block-text " + position + "'>" + block.content + "</p>")
            }
            //tour specific content, deactivate for exploration mode. most often used for tour conclusions
            if (block.tour_content && tour != 'explore'){
                div.insertAdjacentHTML('beforeend', "<p class='block-text " + position + "'>" + block.tour_content + "</p>")
            }
            //source list
            if (block.sources){
                var sources = "<b>Sources</b>";
                block.sources.forEach(function(source){
                    sources += "<p>" + source.title; 
                    if (source.linkText && source.link)
                        sources += " <a target='_blank' href='" + source.link + "'>" + source.linkText + "</a></p>";
                    if (source.linkText && !source.link)
                        sources += " " + source.linkText + "</p>";
                    if (source.note)
                        sources += "<i>" + source.note + "</i></p>";
                })
                div.insertAdjacentHTML('beforeend', sources)
            }
            //insert story block into modal
            storyContent.insertAdjacentElement("beforeend", div)
        })
        //activate pronunciation listener
        storyElem.addEventListener('show.bs.modal', pronounce)
        //audio player
        let audio = document.querySelector("#story-audio");
        audio.src = 'audio/sites/' + storyAudio + '.mp3';
        //close stop when audio ends
        audio.onended = function(){
            storyModal.hide();
            //progress story to next stop
            currentStop++;
            updateStop();
        }
        audioPlayer();
        //activate next button listener for progressing story
        document.querySelector("#next-button").addEventListener("click",function(){
            if (currentStop == tourTotal && tour != "explore")
                window.location.href = "index.html"
            //progress story to next stop
            currentStop++;
            updateStop();
        })
        //show modal
        storyModal.show();
        //activate image zoom
        //imageZoom();
        //clear element of listeners
        storyElem.replaceWith(storyElem.cloneNode(true));
        //activate close listener
        storyElem.addEventListener('hide.bs.modal', updateStop)
        //update stop
        function updateStop(){        
            //add mounds if a certain point in the tour is reached
            if (currentStop == 7){
                addMounds();
            }
            //update route/site styling
            siteLayer.setStyle(siteStyle);
            routeLayer.setStyle(routeStyle);
        }
    }
    //location services
    function getLocation(){
        map.locate({setView:true, watch:true, enableHighAccuracy: true} );
    
        function onLocationFound(e){
            let radius = e.accuracy / 2;
            //removes marker and circle before adding a new one
            if (locationMarker){
                map.removeLayer(circle);
                map.removeLayer(locationMarker);
            }
            //adds location and accuracy information to the map
            if (e.accuracy < 90){
                circle = L.circle(e.latlng, {radius:radius, interactive:false}).addTo(map);
                locationMarker = L.marker(e.latlng,{interactive:false}).addTo(map);
                //locationMarker = L.marker(e.latlng).addTo(map).bindPopup("You are within " + Math.round(radius) + " meters of this point");
            }
            //if accuracy is less than 60m then stop calling locate function
            if (e.accuracy < 40){
                let count = 0;
                map.stopLocate();
                count++;
            }
            //rotate map based on user phone position
            /*if (e.heading !== null) {
				map.setBearing(e.heading);
			}*/

            //let cZoom = map.getZoom();
            //map.setView(e.latlng, cZoom);
            //removeFoundMarker(circle, locationMarker);
        }
    
        map.on('locationfound', onLocationFound);

        //activate location at a regular interval
        window.setInterval( function(){
            map.locate({
                setView: false,
                enableHighAccuracy: true
                });
        }, 2500);
    }
    //implement audio player functionality
    function audioPlayer(){
        //get audio player elements
        let audio = document.querySelector('#story-audio'),
            playPauseButton = document.querySelector('#play-pause'),
            seekBar = document.querySelector('#seek-bar'),
            currentTime = document.querySelector('#current-time'),
            duration = document.querySelector('#duration');
        //display duration of audio clip when metadata is loaded
        audio.addEventListener('loadedmetadata', function() {
            duration.textContent = formatTime(audio.duration);
        });
        //add functionality to the play/pause buttons
        playPauseButton.addEventListener('click', function() {
            if (audio.paused) {
                audio.play();
                playPauseButton.innerHTML = '&#9208';
            } else {
                audio.pause();
                playPauseButton.innerHTML = '&#9205';
            }
        });
        //update time stamp to current time
        audio.addEventListener('timeupdate', function() {
            var value = (audio.currentTime / audio.duration) * 100;
            seekBar.value = value;
            currentTime.textContent = formatTime(audio.currentTime);
            duration.textContent = formatTime(audio.duration);
        });
        //update time slider to current time
        seekBar.addEventListener('input', function() {
            var time = (seekBar.value / 100) * audio.duration;
            audio.currentTime = time;
        });
        //format time for easy reading
        function formatTime(seconds) {
            var minutes = Math.floor(seconds / 60);
            var seconds = Math.floor(seconds % 60);
            if (seconds < 10) 
                seconds = '0' + seconds;

            return minutes + ':' + seconds;
        }
    }
    //function runs when page is finished loading
    window.addEventListener('DOMContentLoaded',(event) => {
        createMap();
        activateTour();
        stopMenu();
    });

})();
