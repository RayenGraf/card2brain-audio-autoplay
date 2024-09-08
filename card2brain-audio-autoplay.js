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
        this.pluginName = "card2brain-audio-autoplay";
        this.reversed = false;

        // get the learnSetID and check if it founded
        this.setLearnSetID(); 
        if(!this.learnSetID){
            console.error(`${this.pluginName}: learnSetID not found`);
            return;
        }

        this.checkLearnCardReversed();
        this.getLeanCardElements();
        this.autoplay();
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
     * getLeanCardElements
     * @description gets the new elements
     * @return {void}
     */
    getLeanCardElements(){
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
        console.log(`${this.pluginName} plugin is loaded`);
    }, 100);
};