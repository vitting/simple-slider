document.addEventListener('DOMContentLoaded', () => {
    let sliderImageQueue = [];
    let slideControlState =  {
        both: "both",
        leftOnly: "leftOnly",
        rightOnly: "rightOnly"
    }

    let slideDirection = {
        left: "left",
        right: "right"
    }

    initSlider();

    function initSlider() {
        const data = getSliderImageData();
        
        initSliderImage(data);
        console.log(data.slideAuto);
        if (!data.slideAuto) {
            initSliderEvents()
            setSlideControlsState(slideControlState.rightOnly);
        } else { 
            sliderControlsVisibleState(false);
            sliderAuto();
        }

        return true;
    }

    function initSliderImage(data) {
        let imgElement = document.querySelector(".slider-current");
        imgElement.id = formatSliderImageNumber(data.currentImage, data.imageCounterFormat, true);
        sliderImageQueue.push(imgElement.id);
        imgElement.addEventListener("animationend", sliderAnimationEnd);
        
        setSlideDirection(slideDirection.left);
        loadImage(data.currentImage, data, imgElement).then((imgBlob) => {
            imgElement.src = URL.createObjectURL(imgBlob);
        });

        return true;
    }

    function initSliderEvents() {
        let slideControlLeft = document.querySelector(".slider-control-left");
        let slideControlRight = document.querySelector(".slider-control-right");

        slideControlLeft.addEventListener("click", () => {
            const data = getSliderImageData();
            let counter = data.currentImage - 1;
            let load = false;
    
            if (counter === 1) {
                setCurrentSlideNumber(counter);
                slideControlsState(slideControlState.rightOnly);
                load = true;
            } else if (counter <= data.numberOfImages) {
                setCurrentSlideNumber(counter);
                slideControlsState(slideControlState.both);
                load = true;
            }
    
            if (load) {
                sliderControlsVisibleState(false);
                addImage(slideDirection.right, counter, data);
            }
        });
    
        slideControlRight.addEventListener("click", () => {
            const data = getSliderImageData();
            let counter = data.currentImage + 1;
            let load = false;
            
            if (counter < data.numberOfImages) {
                setCurrentSlideNumber(counter);
                slideControlsState(slideControlState.both);
                load = true;
            } else if (counter === data.numberOfImages) {
                setCurrentSlideNumber(counter);
                slideControlsState(slideControlState.leftOnly);
                load = true;
            }
           
            if (load) {
                sliderControlsVisibleState(false);
                addImage(slideDirection.left, counter, data);
            }
        });    
    }
    
    function sliderAuto() {
        let interval = setInterval(() => {
            const data = getSliderImageData();
            let counter = 0;
    
            if (data.currentImage <= data.numberOfImages) {
                counter = data.currentImage + 1;
            } 

            if (data.currentImage >= data.numberOfImages) {
                counter = 1;
            }
        
            console.log("CurrentImage: " + data.currentImage + " / NumberOfImages: " + data.numberOfImages + " / Counter: " + counter);

            setCurrentSlideNumber(counter);
            addImage(slideDirection.left, counter, data);
        }, 5000);
    }

    function addImage(direction, counter, data) {
        loadImage(counter, data).then((imgBlob) => {
            let time = data.slideTime;
            let imgCurrent = document.querySelector(".slider-current");
            let sliderImagesContainer = document.querySelector(".slider-images-container");
            let img = document.createElement("img");
            let className = direction === slideDirection.left ? "slider-next" : "slider-previous";
            let animation = direction === slideDirection.left ? "slideLeft " + time + " ease-in 0s 1 forwards" : "slideRight " + time + " ease-in 0s 1 forwards"
            
            img.id = formatSliderImageNumber(counter, data.imageCounterFormat, true);
            sliderImageQueue.push(img.id);
            setSlideDirection(direction);
            img.classList.add(className);
            img.src = URL.createObjectURL(imgBlob);
            sliderImagesContainer.appendChild(img);
            imgCurrent.style.animation = animation;
        });
    }

    function sliderAnimationEnd() {
        const data = getSliderImageData();
        let elementToRemove = sliderImageQueue.shift();
        let className = data.slideDirection === "left" ? "slider-next" : "slider-previous";
        let imgCurrent = document.getElementById(elementToRemove);
        let img = document.querySelector("." + className);
        
        img.classList.add("slider-current")
        imgCurrent.style.display = "none";
        img.classList.remove(className)
        imgCurrent.remove();
        img.addEventListener("animationend", sliderAnimationEnd);

        if (!data.slideAuto) {
            sliderControlsVisibleState(true);
        }
    };

    function sliderControlsVisibleState(show) {
        let sliderControls = document.querySelector(".slider-controls");
        let slideControlLeft = document.querySelector(".slider-control-left");
        let slideControlRight = document.querySelector(".slider-control-right");

        if (show) {
            sliderControls.style.visibility = "visible";
        } else {
            sliderControls.style.visibility = "hidden";
        }
    }

    function loadImage(imageNumberToLoad, data) {
        const imagePath = data.imageFolder + "/" + data.imageName + formatSliderImageNumber(imageNumberToLoad, data.imageCounterFormat, false) + "." + data.imageExtension
        
        return fetch(imagePath)
        .then((response) => response.blob())
        .catch((error) => {
            console.log(error);
        });
    }

    function formatSliderImageNumber(number, format, usePrefix) {
        let formatNumber = "";
        
        for (let i = 0; i < format.length - String(number).length; i++) {
            formatNumber += "0";
        }

        formatNumber += number; 

        if (usePrefix) {
            formatNumber = "slider-image" + formatNumber + "-" + getRandomInt(1, 99999);
        }

        return formatNumber;
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
      }

    function slideControlsState(state) {
        if (getSlideControlsState() !== state) {
            let slideControls = document.querySelector(".slider-controls");
            let slideControlLeft = document.querySelector(".slider-control-left");
            let slideControlRight = document.querySelector(".slider-control-right");
        
            if (state === slideControlState.both) {
                slideControlLeft.style.display = "block";
                slideControlRight.style.display = "block";
                slideControls.style.justifyContent = "space-between";
            } else if (state === slideControlState.leftOnly) {
                slideControlLeft.style.display = "block";
                slideControlRight.style.display = "none";
                slideControls.style.justifyContent = "flex-start";
            } else if (state === slideControlState.rightOnly) {
                slideControlLeft.style.display = "none";
                slideControlRight.style.display = "block";
                slideControls.style.justifyContent = "flex-end";
            }
        }
    
        setSlideControlsState(state);

        return state;
    }

    function setSlideControlsState(state) {
        let slideContainer = document.querySelector(".slider-container");
        slideContainer.dataset.sliderControlsState = state;
        return state;
    }

    function getSlideControlsState() {
        let slideContainer = document.querySelector(".slider-container");
        return slideContainer.dataset.sliderControlsState
    }

    function setCurrentSlideNumber(slideNumber) {
        let slideContainer = document.querySelector(".slider-container");
        slideContainer.dataset.sliderCurrentImage = slideNumber;
        return slideNumber;
    }

    function setSlideDirection(direction) {
        let slideContainer = document.querySelector(".slider-container");
        slideContainer.dataset.sliderDirection = direction;
        return direction;
    }

    function getSliderImageData() {
        let slideContainer = document.querySelector(".slider-container");
        return {
            currentImage: parseInt(slideContainer.dataset.sliderCurrentImage) || 0,
            numberOfImages: parseInt(slideContainer.dataset.sliderNumberOfImages) || 0,
            imageFolder: slideContainer.dataset.sliderImageFolder || null,
            imageName: slideContainer.dataset.sliderImageName || null,
            imageCounterFormat: slideContainer.dataset.sliderImageCounterFormat || null,
            imageExtension: slideContainer.dataset.sliderImageExtension || null,
            slideDirection: slideContainer.dataset.sliderDirection || null,
            slideTime: slideContainer.dataset.sliderSlideTime || null,
            slideAuto: slideContainer.dataset.sliderAuto === "true" ? true : false
        }
    }
}, false);