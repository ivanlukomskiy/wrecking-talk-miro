import {changeColor, findByName, getSelectedRect, getViewCenter} from "./selectors";
import {createImage, drawAbstraction, say, zoomByName} from "./commands";

async function dickOnSelectedItemProcessor(text) {
    if (text !== null) {
        if (text.toLowerCase().indexOf("dick") !== -1) {
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
            await createImage('https://icon2.cleanpng.com/20171220/oeq/smiley-png-5a3a2721b28479.1204919515137605457312.jpg',
                x + width / 2, y + height / 2, width / 7)
            await changeColor(target, '#F590F7')
            return true
        }
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

const ZOOM_REGEXP = new RegExp('zoom on (.*)', 'i')
const FIND_REGEXP = new RegExp('find (.*)', 'i')

async function zoomByNameProcessor(text) {
    let name = null
    const zoomMatch = ZOOM_REGEXP.exec(text)
    if (zoomMatch) {
        name = zoomMatch[1]
    }
    const findMatch = FIND_REGEXP.exec(text)
    if (findMatch) {
        name = findMatch[1]
    }
    if (name !== null) {
        await zoomByName(name)
    }

}


export const WORD_PROCESSORS = [dickOnSelectedItemProcessor]
export const PHRASES_PROCESSORS = [addDickToItemProcessor, likeBlockProcessor, sayTextProcessor, zoomByNameProcessor]