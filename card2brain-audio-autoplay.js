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
            this.getlearnCardsAll();
        //=========================================================
        // Fix Card2Brain Behaviour
        //=========================================================
            this.getLearnCardElements();
            this.autoplay();
        //=========================================================
        console.log(`${this.pluginName} plugin is loaded`);
    }


    /**
     * getlearnCardsAll
     * @description gets the learnCards and their informations
     * @return {void}
     */
    getlearnCardsAll(){
        let learnCards = [];
        let cardsCount = 305;
        for(let i = 0; i < cardsCount-1; i++){
            let url = `https://card2brain.ch/box/${this.learnSetID}/loadNextSlide?chapter=&offset=${i}`
            $.get(url, function(data){
                data = $(data);
                let frontText = data.find(".flip-card-front section.fs-card").html().trim();
                let backText = data.find(".flip-card-back section.fs-card p").html().trim();
                let firstSpeakFunction = data.find(".link[onclick^=speak]:first").attr("onclick");
                let secondSpeakFunction = data.find(".link[onclick^=speak]:last").attr("onclick");
                let CardInfo = {
                    frontText,
                    backText,
                    firstSpeakFunction,
                    secondSpeakFunction
                };
                learnCards.push(CardInfo);
                this.learnCards = learnCards;
            });
        }
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