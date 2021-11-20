const {board} = window.miro;
import {drawAbstraction, createShape} from "./commands.js"

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

async function getViewCenter() {
    let vp = await board.viewport.get()
    return {x: vp.x + vp.width / 2 - 150,
    y: vp.y + vp.height / 2}
}

async function findByName(name) {
    let item = (await board.get()).filter(value => {
        console.log(value.content.toLowerCase().indexOf(name) !== -1, value)
        return value.content.toLowerCase().indexOf(name) !== -1//value.content.toLowerCase() === `<p>${name.toLowerCase()}</p>>`
    })
    if (item.length === 0) {
        return null
    }
    return item[0]
}
async function getSelectedRect() {
    let x = Infinity
    let y = Infinity
    let right= -Infinity
    let bottom = -Infinity
    // console.log(await board.getSelection())
    for (const item of await board.getSelection()) {
        // console.log(item, item.x ,item.y, item.width, item.height)
        x = Math.min(x, item.x - item.width / 2)
        y = Math.min(y, item.y - item.height / 2)
        right = Math.max(right, item.x + item.width / 2)
        bottom = Math.max(bottom, item.y + item.height / 2)
    }
    // console.log(x, y, right, bottom)
    // await board.createShape(createShape({shape_type:"rectangle", x: x, y: y, height:5, width:5, color: "#ff0000"}))
    // await board.createShape(createShape({shape_type:"rectangle", x: x, y: bottom, height:5, width:5, color: "#ff0000"}))
    // await board.createShape(createShape({shape_type:"rectangle", x: right, y: y, height:5, width:5, color: "#ff0000"}))
    // await board.createShape(createShape({shape_type:"rectangle", x: right, y: bottom, height:5, width:5, color: "#ff0000"}))
    return {
        x: x,
        y: y,
        width: right - x,
        height: bottom - y
    }
}
async function init() {
    await board.ui.on("icon:click", async () => {
        let y = 0

        function onAnythingSaid(text) {
            // console.log("Said: ", text)
            let newPart = getNewPart(text)
            if (newPart !== null){
                if (newPart.toLowerCase().indexOf("dick") !== -1) {
                    // getViewCenter().then((x, y) => {
                    //     drawAbstraction(
                    //         x ,y
                    //     )
                    // })
                    getSelectedRect().then(({x, y, width, height}) => {
                        // console.log(x, y, w, h)

                        drawAbstraction(x + width + 50, y + height / 2)
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
            // drawShit(text)

            text = text.toLowerCase();
            if (text.startsWith("dick at ")) {
                let name = text.substr("dick at ".length, text.length)
                console.log("name", name)
                findByName(name).then(item => {
                    console.log(item)
                    if (item !== null) {
                        drawAbstraction(item.x + item.width / 2+ 50, item.y)
                    }
                })
            }
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
