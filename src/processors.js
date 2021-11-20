import {changeColor, findByName, findByCoords, getSelectedRect, getViewCenter} from "./selectors";
import {createImage, drawAbstraction, say, zoomByName, decorateByName, saySmooth} from "./commands";

const {board} = miro;

function regexpProcessor(handler, ...regexps) {
    return async function (text) {
        for (let r of regexps) {
            let match = r.exec(text)
            if (match) {
                return handler(match[1])
            }
        }
    }
}

let biggerProcessor = regexpProcessor(async (text) => {
    let items = await board.getSelection()
    items.forEach((item) => {
        item.height = item.height + 50
        item.width = item.width + 50
        item.sync()
    })
}, new RegExp("bigger", "i"))

let rickRollProcessor = regexpProcessor(async (text) => {
    await board.createEmbed({
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        ...await getViewCenter(),
        width: 300,
        height: 200
    })
}, new RegExp("rick", "i"))

async function dickOnSelectedItemProcessor(text) {
    if (text !== null) {
        if (text.toLowerCase().indexOf("dick") !== -1) {
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

const LIKE_REGEXP = new RegExp('.*?like (.*)', 'i')

async function likeBlockProcessor(text) {
    const match = LIKE_REGEXP.exec(text)
    if (!match) {
        return false
    }

    const targetName = match[1]
    console.log('target name:', targetName)
    const target = await findByName(targetName)
    if (!target) {
        return false
    }

    let isLike = true;
    if (match[0].startsWith('dis')) {
        isLike = false
    }

    console.log('found target', target)
    let {x, y, width, height} = target
    const adornmentX = x + width / 2;
    const adornmentY = y + height / 2;
    const adornment = await findByCoords(adornmentX, adornmentY)
    if (adornment) {
        await miro.board.remove(adornment)
    }
    await createImage(isLike ? 'https://i.ibb.co/Qmgnsqr/like.png' : 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Twemoji_1f4a9.svg/176px-Twemoji_1f4a9.svg.png',
        adornmentX, adornmentY, width / 5)
    let oldColor = target.style.fillColor
    await changeColor(target, isLike ? '#F590F7' : '#CD9575')
    setTimeout(() => {
        changeColor(target, oldColor)
    }, 2000)
    return true
}

let sayTextProcessor = regexpProcessor(saySmooth, new RegExp('say (.*)', 'i'))
let zoomByNameProcessor = regexpProcessor(zoomByName, new RegExp('zoom on (.*)', 'i'), new RegExp('find (.*)', 'i'))

const DECORATE_REGEXP = new RegExp('decorate (.*)', 'i')

async function decorateByNameProcessor(text) {
    const nameMatch = text.match(DECORATE_REGEXP)
    if (!nameMatch) {
        return
    }
    const name = nameMatch[1];
    await decorateByName(name)
}

let poopProcessor = regexpProcessor(async (text) => {
    let poo = await board.createText({
        content: "<p style=\"font-size:100px;\"><font>💩</font></p>", ...await getViewCenter(),
        width: 100
    })
    console.log(poo)
}, new RegExp("(poo)|(poop)|(shit)", "i"))


export const WORD_PROCESSORS = [
    dickOnSelectedItemProcessor,
    poopProcessor
]
export const PHRASES_PROCESSORS = [
    addDickToItemProcessor,
    likeBlockProcessor,
    sayTextProcessor,
    zoomByNameProcessor,
    decorateByNameProcessor,
    biggerProcessor,
    rickRollProcessor
]
