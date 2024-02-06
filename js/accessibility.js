/////////////////////////////////////////////////MAPPING TEEJOP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//This code was beginning in the Summer of 2022, in a place known to the Ho-Chunk people as Teejop (four lakes).                                                                                  //
//The Ho-Chunk were forced to cede Teejop by an 1832 treaty as Euro-Ameircan settlers founded a city called Madison, Wisconsin.                                                                 //
//Over the following decades, the federal and state governments attemped an unsuccessful ethnic cleansing campaign against the Ho-Chunk, who struggled for decades to remain in their homelands.//
//This code was written by Gareth Baldrica-Franklin, a settler living in Teejop.                                                                                                                //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function(){
    let colorMode, textSize;
    //get cached settings
    function getSettings(){     
        //get color setting
        colorMode = localStorage.getItem("color") ? localStorage.getItem("color") : "light";
        localStorage.setItem("color", colorMode);
        //change color accordingly
        changeColor();
        //get text size setting
        textSize = localStorage.getItem("text") ? localStorage.getItem("text") : "20px";
        localStorage.setItem("text", textSize);
        //change text size accordingly
        changeTextSize(textSize);
    }

    //collasable menu
    function collapseMenu(){
        if (document.querySelector(".navbar-nav").style.visibility == "visible"){
            document.querySelector(".navbar-nav").style.visibility = "hidden";
        }
        else{
            document.querySelector(".navbar-nav").style.visibility = "visible";
        }
    }
    //accessibility settings
    function accessibility(){
        document.querySelector(".text-active").classList.remove("text-active");
        //text size buttons
        document.querySelectorAll(".text-size").forEach(function(button){
            //set font size for each buttton
            let size = button.value;
            button.style.fontSize = size;
            if (size == textSize) 
                button.classList.add("text-active");
            //update text size for all p elements when button is clicked
            button.addEventListener("click", function(){
                document.querySelector(".text-active").classList.remove("text-active");
                button.classList.add("text-active");
                changeTextSize(size);
            })
        })
        //dark mode
        document.querySelector("#dark-mode").addEventListener("click", function(){
            colorMode = "dark";
            //cache color mode selection
            localStorage.setItem("color", colorMode);
            //change color in stylesheet
            changeColor();
            document.querySelector("button#dark-mode").style.backgroundColor = "white";
        })
        //light mode
        document.querySelector("#light-mode").addEventListener("click", function(){
            colorMode = "light";
            //cache color mode selection
            localStorage.setItem("color", colorMode);
            //change color in stylesheet
            changeColor();
        })
    }
    //change text size
    function changeTextSize(size){
        //change all instances of font size across document
        document.querySelectorAll(".font-size").forEach(function(text){
            text.style.fontSize = size;
            localStorage.setItem("text",size);
        })
    }
    //change color mode
    function changeColor(){
        //get stylesheet
        const styleEl = document.createElement('style');
        //append <style> element to <head>
        document.head.appendChild(styleEl);
        //grab style element's sheet
        const sheet = styleEl.sheet;
        //for dark mode
        if (colorMode == "dark"){
            document.querySelectorAll("body, navbar, .modal-header, .modal-footer, .modal-content, .leaflet-control-zoom-out, .leaflet-control-zoom-in").forEach(function(elem){
                if (elem.classList.contains("light"))
                    elem.classList.remove("light");
                elem.classList.add("dark");
            });
        }
        //for light mode
        if (colorMode == "light"){
            document.querySelectorAll("body, navbar, .modal-header, .modal-footer, .modal-content, .leaflet-control-zoom-in, .leaflet-control-zoom-out").forEach(function(elem){
                if (elem.classList.contains("dark"))
                    elem.classList.remove("dark");
                elem.classList.add("light");
            });
        }
    }

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

    window.addEventListener('DOMContentLoaded',(event) => {
        //get color and text size settings
        getSettings();
        //home page functions
        if (document.querySelector("#tours")){
            accessibility();
            homePronounce();
        }
        document.querySelector(".nav-collapse").addEventListener("click",collapseMenu)
    });
})();
