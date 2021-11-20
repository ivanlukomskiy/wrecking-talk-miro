const {board} = window.miro;
import {drawAbstraction, createShape, say} from "./commands.js"
import {runSpeechRecognition} from "./recognition";
import {getSelectedRect, findByName, getViewCenter} from "./selectors";

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

async function dickOnSelectedItemProcessor(text) {
    let newPart = getNewPart(text)
    if (newPart !== null) {
        if (newPart.toLowerCase().indexOf("dick") !== -1) {
            // getViewCenter().then((x, y) => {
            //     drawAbstraction(
            //         x ,y
            //     )
            // })
            const rect = await getSelectedRect()
            let x, y, width, height
            if (rect !== null) {
                ({x, y, width, height} = rect)
            } else {
                ({x, y} = await getViewCenter())
                width = -50
                height = 0
            }
            await drawAbstraction(x + width + 50, y + height / 2)
            return true
        }
    }
    return false
}

async function addDickToItemProcessor(text) {
    textCache = new Set()
    lastText = undefined
    text = text.toLowerCase();
    if (text.startsWith("dick at ")) {
        let name = text.substr("dick at ".length, text.length)
        console.log("name", name)
        const item = findByName(name)
        console.log(item)
        if (item !== null) {
            await drawAbstraction(item.x + item.width / 2 + 50, item.y)
            return true
        }
    }
    return false
}

const LIKE_REGEXP = new RegExp('like (.*)', 'i')

async function likeBlockProcessor(text) {
    const match = LIKE_REGEXP.exec(text)
    if (match) {
        const target = match[1]
        console.log('target', target)
        return true
    }
    return false
}

const SAY_REGEXP = new RegExp('say (.*)', 'i')

async function sayTextProcessor(text) {
    const match = SAY_REGEXP.exec(text)
    if (match) {
        await say(match[1])
    }
}

const WORD_PROCESSORS = [dickOnSelectedItemProcessor]
const PHRASES_PROCESSORS = [addDickToItemProcessor, likeBlockProcessor, sayTextProcessor]

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
            onAnythingSaidAsync(text)
        }

        async function onFinalisedAsync(text) {
            console.log("Finalized: ", text)
            for (let proc of PHRASES_PROCESSORS) {
                if (await proc(text)) {
                    return
                }
            }
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

        initSpeechRecgnition()
    });
}

init();
