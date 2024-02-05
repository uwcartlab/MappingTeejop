(function(){
    let colorMode = localStorage.getItem("color") ? localStorage.getItem("color") : "light";
    localStorage.setItem("color", colorMode);
    let textSize = localStorage.getItem("text") ? localStorage.getItem("text") : "20px";
    localStorage.setItem("text", textSize);
    //set listener for extra text on the splash screen
    function setTextListeners(){
        //read more button
        document.querySelectorAll(".read-more-button").forEach(function(button){
            let id = button.id.charAt(button.id.length-1);

            button.addEventListener("click",function(e){
                if (button.innerHTML == "Read More")
                    button.innerHTML = "Collapse"
                else    
                    button.innerHTML = "Read More"
                
                document.querySelectorAll(".read-more-text").forEach(function(block){
                    let blockId = block.id.charAt(block.id.length-1);
                    if (blockId == id){
                        if (block.style.display == "none")
                            block.style.display = "block";
                        else    
                            block.style.display = "none";
                    }
                })
            })
        })
        //close menu
        document.querySelectorAll(".nav-button").forEach(function(elem){
            elem.addEventListener("click",collapseMenu);
        })
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
        changeTextSize(textSize);
        function changeTextSize(size){
            document.querySelectorAll(".font-size").forEach(function(text){
                text.style.fontSize = size;
                localStorage.setItem("text",size);
            })
        }
        //color modes
        const styleEl = document.createElement('style');
        //append <style> element to <head>
        document.head.appendChild(styleEl);
        //grab style element's sheet
        const sheet = styleEl.sheet;
        document.querySelector("#dark-mode").addEventListener("click", function(){
            colorMode = "dark";
            localStorage.setItem("color", colorMode);
            changeColor();
        })
        document.querySelector("#light-mode").addEventListener("click", function(){
            colorMode = "light";
            localStorage.setItem("color", colorMode);
            changeColor();
        })
        changeColor();
        function changeColor(){
            if (colorMode == "dark"){
                document.querySelectorAll("body, navbar, .modal-header, .modal-footer, .modal-content, .leaflet-control-zoom-out, .leaflet-control-zoom-in").forEach(function(elem){
                    if (elem.classList.contains("light"))
                        elem.classList.remove("light");
                    elem.classList.add("dark");
                    //leaflet styling
                    for (let i = 0; i < sheet.cssRules.length; i++){
                        sheet.deleteRule(i);
                    }
                    sheet.insertRule('.leaflet-popup-content-wrapper { background: black }', 0);
                    sheet.insertRule('.leaflet-popup-content-wrapper { color: white }', 0);
                    sheet.insertRule('.location-control-container { background: black !important }', 0);
                    sheet.insertRule('.leaflet-control-rotate-toggle { background: black !important }', 0);
                    sheet.insertRule('.leaflet-popup-tip { background: black }', 0);
                });
                document.querySelector("button#dark-mode").style.backgroundColor = "white";
            }
            if (colorMode == "light"){
                document.querySelectorAll("body, navbar, .modal-header, .modal-footer, .modal-content, .leaflet-control-zoom-in, .leaflet-control-zoom-out").forEach(function(elem){
                    if (elem.classList.contains("dark"))
                        elem.classList.remove("dark");
                    elem.classList.add("light");
                    //leaflet styling
                    for (let i = 0; i < sheet.cssRules.length; i++){
                        sheet.deleteRule(i);
                    }
                });
            }
        }
    }

    //function to create pronunciation listeners
    function pronounce(){
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
        setTextListeners();
        accessibility();
        pronounce();
        document.querySelector(".nav-collapse").addEventListener("click",collapseMenu)
    });
})();
