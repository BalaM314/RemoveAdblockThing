// ==UserScript==
// @name         Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Removes Adblock Thing
// @author       JoelMatic, BalaM314
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==
(function(){
    
    //Config
    const adblocker = false; // Enable The Undetected Adblocker
    const removePopup = true; // Enable The Popup remover
    const debug = true; // Enable debug messages into the console

    //Specify domains and JSON paths to remove
    const domainsToRemove = [
        '*.youtube-nocookie.com/*'
    ];
    const jsonPathsToRemove = [
        'playerResponse.adPlacements',
        'playerResponse.playerAds',
        'adPlacements',
        'playerAds',
        'playerConfig',
        'auxiliaryUi.messageRenderers.enforcementMessageViewModel'
    ];

    const observerConfig = {
        childList: true,
        subtree: true
    };

    //This is used to check if the video has been unpaused already
    let shouldUnpause = false;

    function logTag(message){
        if(debug) console.log("%c[Remove Adblock Thing]%c " + message, "font-weight: bold; color: cyan;", "");
    }

    function popupRemover(){
        removeJsonPaths(domainsToRemove, jsonPathsToRemove);
        setInterval(() => {

            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");

            const video1 = document.querySelector("#movie_player > video.html5-main-video");
            const video2 = document.querySelector("#movie_player > .html5-video-container > video");

            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");

            if(popup){
                document.getElementById("dismiss-button").click();
                document.getElementsByClassName("ytp-play-button ytp-button")[0].click();
                
                logTag("Popup detected, removing...");
                popup.remove();
                modalOverlay?.removeAttribute("opened");
                shouldUnpause = true;
                logTag("Popup removed");
            }

            // Check if the video is paused after removing the popup
            if(shouldUnpause && (video1.paused || video2.paused)){
                unPauseVideo();
                shouldUnpause = false;
            }
        }, 200);
    }
    // undetected adblocker method
    function addblocker(){
        setInterval(() => {
            const skipBtn = document.querySelector('.videoAdUiSkipButton,.ytp-ad-skip-button');
            const ad = [...document.querySelectorAll('.ad-showing')][0];
            const sidAd = document.querySelector('ytd-action-companion-ad-renderer');
            if(ad){
                document.querySelector('video').playbackRate = 10;
                skipBtn?.click();
            }

            sidAd?.remove();
        }, 50);
    }
    // Unpause the video Works most of the time
    function unPauseVideo(){
        // Simulate pressing the "k" key to unpause the video
        const keyEvent = new KeyboardEvent("keydown", {
            key: "k",
            code: "KeyK",
            keyCode: 75,
            which: 75,
            bubbles: true,
            cancelable: true,
            view: window
        });
        document.dispatchEvent(keyEvent);
        unpausedAfterSkip = 0;
        if(debug) console.log("Remove Adblock Thing: Unpaused video using 'k' key");
    }
    function removeJsonPaths(domains, jsonPaths){
        const currentDomain = window.location.hostname;
        if (!domains.includes(currentDomain)) return;

        jsonPaths.forEach(jsonPath => {
            const pathParts = jsonPath.split('.');
            let obj = window;
            for(const part of pathParts){
                if(obj.hasOwnProperty(part))
                    obj = obj[part];
                else break;
            }
            obj = undefined; //how does this work?
        });
    }
    // Observe and remove ads when new content is loaded dynamically
    const observer = new MutationObserver(() =>
        removeJsonPaths(domainsToRemove, jsonPathsToRemove)
    );


    //main
    logTag("Script started");
    // Old variable but could work in some cases
    window.__ytplayer_adblockDetected = false;

    if(adblocker){
        addblocker();
    }
    if(removePopup){
        popupRemover();
        observer.observe(document.body, observerConfig);
    }

})();
