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

unsafeWindow.onload = function () {
    setTimeout(function (){
        initCard2BrainAudio2Test();
        console.log("card2brain-audio-autoplay plugin is loaded");
    }, 100);


    function initCard2BrainAudio2Test(){
        let learnCard = $(".learn-card");
        let audiobutton = learnCard.find(".link[onclick^=speak]")
        audiobutton.click();
    }
};