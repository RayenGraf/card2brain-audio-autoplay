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
            this.startObserver();
            this.getLearnCardElements();
        //=========================================================
    }


    /**
     * startObserver
     * @description starts the observer (when the learnCard is loaded)
     * @return {void}
     */
    startObserver(){
        // Select the node that will be observed for mutations
        const targetNode = document.getElementById("currentCard");

        // Options for the observer (which mutations to observe)
        const config = { attributes: false, childList: true, subtree: true };

        // Callback function to execute when mutations are observed
        const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
                if (mutation.type === "childList") {
                    if(mutation.addedNodes.length){

                        // load the learnCards and fixes the audio button
                        this.getLearnCardElements();
                        this.fixAudioButton();

                        // autoplay if new card is loaded
                        if($(".currentCard .text-error").length == 0 && $("#dontKnowAnswer").length == 0){
                            this.autoplay();
                        } else{
                            let findedObject = this.getCurrentCardObject();
                            if(findedObject) eval(this.reversed? findedObject.frontSpeakFunction : findedObject.backSpeakFunction);
                        }
                    }
                }
            }
        };

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
    }

    /**
     * getCurrentCardText
     * @returns {string} currentText
     */
    getCurrentCardText(){
        let currentElement = $(".currentCard .col-12:first section.fs-card");
        let currentText = currentElement.html() || "";

        // remove the html tags and get main text
        currentElement.children().each(function(){
            currentText = currentText.replace($(this).prop("outerHTML"), "");
        });

        // trim and return
        currentText = currentText.trim();
        return currentText;
    }

    /**
     * getCurrentCardObject
     * @returns {object} findedObject
     */
    getCurrentCardObject(){
        let learnCards = this.getlearnCardsAll();
        console.log( "learnCards", learnCards );
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
     * getLearnCardCount
     * @description gets the learnCards count
     * @returns {number} cardsCount
     */
    async getLearnCardCount(){
        let url = `https://card2brain.ch/box/${this.learnSetID}`;
        let promise = new Promise((resolve, reject) => {
            $.get(url, function(data) {
                try {
                    data = $(data);
                    let count = parseInt(data.find(".fal.fa-credit-card-blank + .ms-2").html());
                    resolve(count);
                } catch (error) {
                    reject(error);
                    console.error(error);
                }
            });
        });

        let result = await promise;
        return result;
    }

    /**
     * setlearnCardsAll
     * @description sets the learnCards and their informations
     * @return {void}
     */
    async setlearnCardsAll() {
        let learnCards = [];
        let cardsCount = await this.getLearnCardCount();
        let promises = [];
        let instance = this;

        for (let i = 0; i < cardsCount; i++) {
            let url = `https://card2brain.ch/box/${this.learnSetID}/loadNextSlide?chapter=&offset=${i}`;
            
            let promise = new Promise((resolve, reject) => {
                $.get(url, function(data) {
                    try {
                        data = $(data);
                        let frontText = data.find(".flip-card-front section.fs-card").html().trim();
                        let backText = data.find(".flip-card-back section.fs-card p").html().trim();
                        let fixFrontText = instance.fixApostrophe(frontText);
                        let fixBackText = instance.fixApostrophe(backText);
                        let frontSpeakFunction = data.find(".link[onclick^=speak]:first").attr("onclick").replace(frontText, fixFrontText);
                        let backSpeakFunction = data.find(".link[onclick^=speak]:last").attr("onclick").replace(backText, fixBackText);
                        let frontIconButton = data.find(".link[onclick^=speak]:first").prop('outerHTML').replace(frontText, fixFrontText);
                        let backIconButton = data.find(".link[onclick^=speak]:last").prop('outerHTML').replace(backText, fixBackText);
                        
                        let CardInfo = {
                            frontText,
                            backText,
                            frontSpeakFunction,
                            backSpeakFunction,
                            frontIconButton,
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
     * fixApostrophe
     * @description fixes the apostrophe, escape the apostrophe
     * @param {String} text 
     * @returns 
     */
    fixApostrophe(text){
        return text.replaceAll(/'/g, "\\\'");
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