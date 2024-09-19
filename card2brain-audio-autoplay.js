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

                        // autoplay if new card is loaded
                        if($(".currentCard .text-error").length == 0 && $("#dontKnowAnswer").length == 0){
                            this.autoplay();
                        } else{
                            this.autoplaySecondary();
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
        let audioButtons = this.learnCard.find(".link[onclick^=speak]");
        this.primaryAudioButton = audioButtons[0] || null;
        this.secondaryAudioButton = audioButtons[1] || null;
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
     * autoplaySecondary
     * @description plays the secondary audio directly in the learning section
     * @return {void}
     */
    autoplaySecondary(){
        this.secondaryAudioButton.click();
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