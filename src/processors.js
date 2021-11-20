import {changeColor, findByName, getSelectedRect, getViewCenter} from "./selectors";
import {createImage, drawAbstraction, say, zoomByName, decorateByName} from "./commands";

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

async function biggerProcessor(text) {
    let item = findByName(text)
    if (item !== null) {
        item.height += 50
        item.width += 50
        await item.sync()
    }
}

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

const LIKE_REGEXP = new RegExp('like (.*)', 'i')

async function likeBlockProcessor(text) {
    const match = LIKE_REGEXP.exec(text)
    if (match) {
        const targetName = match[1]
        console.log('target name:', targetName)
        const target = await findByName(targetName)
        if (target) {
            console.log('found target', target)
            let {x, y, width, height} = target
            await createImage('https://i.ibb.co/Qmgnsqr/like.png',
                x + width / 2, y + height / 2, width / 5)
            let oldColor = target.style.fillColor
            await changeColor(target, '#F590F7')
            setTimeout(() => {
                changeColor(target, oldColor)
            }, 2000)
            return true
        }
    }
    return false
}


let sayTextProcessor = regexpProcessor(say, new RegExp('say (.*)', 'i'))
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
        content: "<p style=\"font-size:100px;\">💩</p>", ...await getViewCenter(),
        width: 100
    })
    console.log(poo)
}, new RegExp("(poo)|(poop)|(shit)", "i"))


export const WORD_PROCESSORS = [dickOnSelectedItemProcessor, poopProcessor]
export const PHRASES_PROCESSORS = [addDickToItemProcessor, likeBlockProcessor, sayTextProcessor, zoomByNameProcessor, decorateByNameProcessor]