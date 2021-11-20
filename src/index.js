import {PHRASES_PROCESSORS, WORD_PROCESSORS} from "./processors";
import {runSpeechRecognition} from "./recognition";
import {addCat, saySmooth} from "./commands";

const {board} = window.miro;

let textCache = new Set();
let lastText = undefined;

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
        async function onAnythingSaidAsync(text) {
            for (let proc of WORD_PROCESSORS) {
                if (await proc(text)) {
                    return
                }
            }
        }

        function onAnythingSaid(text) {
            console.log('on anything said', text)
            onAnythingSaidAsync(getNewPart(text))
        }

        async function onFinalisedAsync(text) {
            console.log("Finalized: ", text)
            for (let proc of PHRASES_PROCESSORS) {
                if (await proc(text)) {
                    return
                }
            }
            textCache = new Set()
            lastText = undefined
        }

        function onFinalised(text) {
            console.log("Finalized: ", text)
            onFinalisedAsync(text)
        }

        async function onEndEvent() {
            initSpeechRecgnition()
        }

        function initSpeechRecgnition() {
            runSpeechRecognition(onAnythingSaid, onFinalised, onEndEvent)
        }
        addCat()
        initSpeechRecgnition()
    });
}

init();

// setInterval(() => {
//     saySmooth("You little kitten!")
// }, 15000)