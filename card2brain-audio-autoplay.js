// ==UserScript==
// @name         card2brain-audio-autoplay
// @namespace    http://tampermonkey.net/
// @version      2024-09-08
// @description  The audio is played directly in the learning section in card2brain
// @author       RaynGraf
// @match        https://card2brain.ch/learn/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=card2brain.ch
// @run-at       document-end
// @grant        unsafeWindow
// ==/UserScript==

/**
 * Class Card2Brain_LearnSectionFixes
 * @description fixes the autoplay + audio buttons in the learning section
 * @return {void}
 */
class Card2Brain_LearnSectionFixes{
    static pluginName;

    static learnSetID;
    static learnCards;
    static reversed;

    static learnCard;
    static primaryAudioButton;
    static secondaryAudioButton;

    /**
     * constructor
     * @description consstructor
     * @return {void}
     */
    constructor() {
        // plugin details
        this.pluginName = "card2brain-audio-autoplay";

        //=========================================================
        // Card2Brain Informations 
        //=========================================================
            // get the learnSetID and check if it founded
            this.setLearnSetID(); 
            if(!this.learnSetID){
                console.error(`${this.pluginName}: learnSetID not found`);
                return;
            }

            // check if the learnCard is reversed
            this.reversed = false;
            this.checkLearnCardReversed();

            // get the learnCards
            this.learnCards = [];
            this.setlearnCardsAll();
        //=========================================================
        // Fix Card2Brain Behaviour
        //=========================================================
            this.initListener();
            this.getLearnCardElements();
        //=========================================================
    }

    /**
     * initListener
     * @description inits the global listener
     * @return {void}
     */
    initListener(){
        let instance = this;
        let body = $("body");
        console.log( "INIT LISTENER" );
        body.on("click",function(e){
            let targetElement = $(e.target);

            if(targetElement.attr("id") === "nextCard" || (targetElement.attr("type") === "submit" && targetElement.parents(".nextCard").length )){
                console.log( "NEXT ANSWER CLICKED" );
                instance.fixAudioButton();
                instance.initCheckAnwsersListener(instance);
            }
        });
        instance.initCheckAnwsersListener(instance);
    }

    /**
     * initCheckAnwsersListener
     * @param {Card2Brain_LearnSectionFixes} instance 
     */
    initCheckAnwsersListener(instance){
        let button = $("#checkAnswer");
        button.on("click",function(e){
            console.log( "CHECK ANSWER CLICKED" );
            let reversed = instance.reversed;
            let findedObject = instance.getCurrentCardObject();
            if(findedObject) eval(reversed? findedObject.frontSpeakFunction : findedObject.backSpeakFunction);
        });
    }

    /**
     * getCurrentCardText
     * @returns {string} currentText
     */
    getCurrentCardText(){
        let currentElement = $(".currentCard .col-12:first section.fs-card");
        let currentText = currentElement.html() || "";
        currentElement.children().each(function(){
            currentText = currentText.replace($(this).prop("outerHTML"), "");
        });
        currentText = currentText.trim();
        return currentText;
    }

    /**
     * getCurrentCardObject
     * @returns {object} findedObject
     */
    getCurrentCardObject(){
        let learnCards = this.getlearnCardsAll()
        let currentText = this.getCurrentCardText();
        let findedObject = this.reversed? learnCards.find(obj => obj.backText === currentText) : learnCards.find(obj => obj.frontText === currentText);
        console.log( "currentText", currentText,"findedObject",  findedObject );
        return findedObject
    }

    /**
     * getlearnCardsAll
     * @description gets the learnCards and their informations
     * @return {void}
     */
    getlearnCardsAll(){
        return this.learnCards;
    }

    /**
     * setlearnCardsAll
     * @description sets the learnCards and their informations
     * @return {void}
     */
    setlearnCardsAll() {
        let learnCards = [];
        let cardsCount = 305;
        let promises = [];
    
        for (let i = 0; i < cardsCount - 1; i++) {
            let url = `https://card2brain.ch/box/${this.learnSetID}/loadNextSlide?chapter=&offset=${i}`;
            
            let promise = new Promise((resolve, reject) => {
                $.get(url, function(data) {
                    try {
                        data = $(data);
                        let frontText = data.find(".flip-card-front section.fs-card").html().trim();
                        let backText = data.find(".flip-card-back section.fs-card p").html().trim();
                        let frontSpeakFunction = data.find(".link[onclick^=speak]:first").attr("onclick");
                        let backSpeakFunction = data.find(".link[onclick^=speak]:last").attr("onclick");
                        let backIconButton = data.find(".link[onclick^=speak]:last").prop('outerHTML');
                        
                        let CardInfo = {
                            frontText,
                            backText,
                            frontSpeakFunction,
                            backSpeakFunction,
                            backIconButton
                        };
                        
                        resolve(CardInfo); // Resolve the promise with the card info
                    } catch (error) {
                        reject(error); // Reject the promise if an error occurs
                    }
                });
            });
    
            promises.push(promise); // Push each promise into the array
        }
    
        // Use Promise.all to wait for all promises to resolve
        Promise.all(promises)
            .then(results => {
                // Push all card info into learnCards
                learnCards.push(...results);
                this.learnCards = learnCards;
                console.log(this.learnCards);

                this.fixAudioButton();
                this.autoplay();

                let successMessage = `${this.pluginName} plugin is loaded`;
                console.log(successMessage);
                alert(successMessage);
            })
            .catch(error => {
                console.error("An error occurred:", error);
            });
    }

    /**
     * setLearnSetID
     * @description set the learnSetID
     * @return {void}
     */
    setLearnSetID(){
        const url = window.location.href;
        const match = url.match(/\/(\d{8}[^\/]*)\/?/);
        if (match)  this.learnSetID = match[1]; 
    }

    /**
     * checkLearnCardReversed
     * @description checks if the learnCard is reversed
     * @return {void}
     */
    checkLearnCardReversed(){
        const url = window.location.href;
        if(url.includes("reversed")) this.reversed = true;
    }

    /**
     * getLearnCardElements
     * @description gets the new elements
     * @return {void}
     */
    getLearnCardElements(){
        this.learnCard = $(".learn-card");
        this.primaryAudioButton = this.learnCard.find(".link[onclick^=speak]")
        this.secondaryAudioButton = null;
    }

    /**
     * autoplay
     * @description plays the audio directly in the learning section
     * @return {void}
     */
    autoplay(){
        console.log("autoplay")
        console.log( this.primaryAudioButton );
        this.primaryAudioButton.click();
    }

    /**
     * fixAudioButton
     * @description fixes the audio button
     * @return {void}
     */
    fixAudioButton(){
        if(this.reversed){
            let findedObject = this.getCurrentCardObject();
            if(findedObject){
                console.log("fix audio button");
                this.primaryAudioButton.attr("onclick", findedObject.backSpeakFunction);
                // this.primaryAudioButton.trigger("click");
            } 
        }
    }

}

/**
 * INIT
 * @description loads the plugin
 * @return {void}
 */
unsafeWindow.onload = function () {
    setTimeout(function (){
        new Card2Brain_LearnSectionFixes();
    }, 100);
};