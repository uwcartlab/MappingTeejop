/////////////////////////////////////////////////MAPPING TEEJOP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//This code was written beginning in the Summer of 2022, in a place known to the Ho-Chunk people as Teejop (four lakes).                                                                                  //
//The Ho-Chunk were forced to cede Teejop by an 1832 treaty as Euro-Ameircan settlers founded a city called Madison, Wisconsin.                                                                 //
//Over the following decades, the federal and state governments attemped an unsuccessful ethnic cleansing campaign against the Ho-Chunk, who struggled for decades to remain in their homelands.//
//This code was written by Gareth Baldrica-Franklin, a settler living in Teejop, with input from our project team, including Kasey Keeler, Sasha Suarez, Molli Pauliot, Sarah Tate, Jen Rose Smith, and Kendra Greendeer.                                                                                                             //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function(){
    //function to create pronunciation listeners
    function homePronounce(){
        document.querySelectorAll(".pronounce").forEach(function(elem){
            elem.addEventListener("click",function(e){
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
                let font = window.getComputedStyle(document.querySelector(".font-size"), null).getPropertyValue("font-size");
                document.querySelector(".play").style.top = e.target.offsetTop - parseInt(font) + "px";
                document.querySelector(".play").style.left = e.target.offsetLeft + "px";
                document.querySelector(".play").style.fontSize = font; 
                //remove audio after it finishes playing
                audio.onended = function(){
                    audio.remove();
                    document.querySelector(".play").remove();
                }
            })
        })
    }
    //load tours csv
    fetch("data/tours.csv")
            .then(res => res.text())
            .then(data => {
                //parse csv
                data = Papa.parse(data,{
                    header:true
                }).data;
                data.forEach(function(d,i){
                    //select tour row container
                    let tourRows = document.querySelector("#tour-rows");
                    //create new tour row
                    let row = document.createElement("div");
                        row.classList = ["tour row"]
                    //CREATE TOUR IMAGE
                    let imageDiv = document.createElement("div")
                        imageDiv.classList = ["tour-img col-lg-4 col-md-5 col-sm-6 col-12"]
                        //create image and caption
                        let img = '<img src="img/' + d.Photo + '.jpg" alt="' + d.PhotoAlt + '"></img>',
                            caption = '<p class="caption">' + d.PhotoCaption + '</p>';
                        //combine image and caption with image div
                        imageDiv.insertAdjacentHTML("beforeend",img + caption)
                    //add image to row
                    row.insertAdjacentElement("beforeend",imageDiv)

                    //CREATE TOUR DESCRIPTION
                    let descDiv = document.createElement("div")
                        descDiv.classList = ["tour-desc col-lg-8 col-md-7 col-sm-6 col-12"]
                        //Ho-Chunk tour name
                        let name = d.NameHoChunk ? d.NameHoChunk: d.NameEnglish,
                            displayName = d.Location == 'arboretum' ? name + " (UW Arboretum)":name;
                        //tour code
                        let tour = d.TourNumber == 'explore' ? 'explore': 'tour' + d.TourNumber;
                        //description text 
                        let descriptionText = d.Description.replaceAll("[pronounceStart]","<b class='pronounce'>").replaceAll("[pronounceEnd]","</b>");

                        //create title, description, starting text, accessibility text, and button
                        let title = '<h3 class="tour-title"><b>' + displayName + '</b><i class="translation">' + d.NameEnglish + '</i></h3>',
                            translation = d.NameHoChunk ? "": '<p><b><i>Ho-Chunk Translation Coming Soon</i></b></p>';
                            description = '<p>' + descriptionText + '</p>',
                            starting = d.Starting ? '<p><b class="begin">' + d.Starting + '</b></p>': "",
                            accessibility = d.Accessibility ? '<p>Accessibility Note: <i class="accessibilty">' + d.Accessibility + '</i></p>': "";
                        
                        let button = d.Active == 'TRUE' ? '<button class="tour-button" data-bs-dismiss="modal"><a href="map.html#' + tour + '">Start ' + name + '</a></button>' : '<p><b><i>Coming 2025</i></b></p>';
                        //combine description elements
                        descDiv.insertAdjacentHTML("beforeend",title + translation + description + starting + accessibility + button);
                    //add description to row
                    row.insertAdjacentElement("beforeend",descDiv)

                    //add graphics
                    if (d.Graphic){
                        for (let i = 0; i < 4; i++){
                            let className = i == 1 || i == 3 ? "flip tour-graphic" : "tour-graphic";
                            
                            let graphic = '<img src="img/graphics/' + d.Graphic + '.png" class="' + className + '"></img>'
                            row.insertAdjacentHTML("beforeend",graphic)
                        }
                    }

                    //add html to the container
                    tourRows.insertAdjacentElement("beforeend",row)
                })
                
                homePronounce();
            })
})();
