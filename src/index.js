const {board} = window.miro;
import {drawAbstraction} from "./commands.js"

let textCache = new Set();
let lastText = undefined;

function runSpeechRecognition(onAnythingSaid, onFinalised, onEndEvent) {
    var language = 'en-US';
    if (!('webkitSpeechRecognition' in window)) {
        throw new Error("This browser doesn't support speech recognition. Try Google Chrome.");
    }
    var SpeechRecognition = window.webkitSpeechRecognition;
    let recognition = new SpeechRecognition();
    recognition.interimResults = !!onAnythingSaid;
    recognition.lang = language;
    var finalTranscript = ''; // process both interim and finalised results

    recognition.onresult = function (event) {
        var interimTranscript = ''; // concatenate all the transcribed pieces together (SpeechRecognitionResult)

        for (var i = event.resultIndex; i < event.results.length; i += 1) {
            if (event.results[i].length === 0) {
                continue;
            }
            var transcriptionPiece = event.results[i][0].transcript; // check for a finalised transciption in the cloud
            if (event.results[i].isFinal) {
                finalTranscript += transcriptionPiece;
                onFinalised(finalTranscript);
                finalTranscript = '';
            } else if (recognition.interimResults) {
                interimTranscript += transcriptionPiece;
                onAnythingSaid(interimTranscript);
            }
        }
    };

    recognition.onend = function () {
        onEndEvent();
    };
    recognition.start();
}

function commonPrefix(words1, words2) {
    for (let i = 0; i < Math.min(words1.length, words2.length); i++) {
        if (words1[i] !== words2[i]) {
            return words1.slice(0, i)
        }
    }
    return words1.slice(0, Math.min(words1.length, words2.length))
}

function cutCommonPrefix(str1, strToCut) {
    let words = strToCut.split(" ")
    return words.slice(commonPrefix(str1.split(" "), words).length, words.length).join(" ")
}

function getNewPart(text) {
    if (!textCache.has(text)) {
        // console.log(`Old text: ${textCache}`)
        // console.log(`New text: ${text}`)
        let newPart
        if (lastText === undefined) {
            newPart = text
        } else {
            newPart = cutCommonPrefix(lastText, text)
        }
        textCache.add(text);
        lastText = text;
        return newPart
    }
    return null
}
async function init() {
    await board.ui.on("icon:click", async () => {
        let y = 0

        function onAnythingSaid(text) {
            // console.log("Said: ", text)
            let newPart = getNewPart(text)
            if (newPart !== null){
                if (newPart.toLowerCase().indexOf("dick") !== -1) {
                    board.viewport.get().then(vp => {
                        drawAbstraction(
                            vp.x + vp.width / 2 - 150,
                            vp.y + vp.height / 2
                        )
                    })
                }
            }

        }

        async function drawShit(text) {
            await board.createText({
                content: text,
                width: 720,
                x: 0,
                y
            })
            y += 15
        }

        function onFinalised(text) {
            console.log("Finalized: ", text)
            textCache = new Set()
            lastText = undefined
            drawShit(text)

        }

        function onEndEvent() {
            initSpeechRecgnition()
        }

        function initSpeechRecgnition() {
            runSpeechRecognition(onAnythingSaid, onFinalised, onEndEvent)
        }

        initSpeechRecgnition()
    });
}

init();
