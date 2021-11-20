import {changeColor, findByName, findByCoords, getSelectedRect, getViewCenter, getInView} from "./selectors";
import {
    createImage,
    drawAbstraction,
    say,
    zoomByName,
    saySmooth,
    sleep,
    createText,
    addCat,
    removeCat,
    decorate,
    removeDecorations,
    removeColor,
    createShape,
    removeByName,
} from "./commands";
import {convert} from './colorsMap';

const FIRES_PIC = 'https://github.com/ivanlukomskiy/wrecking-talk-miro/blob/main/src/assets/fires.png?raw=true'
const ELIMINATED_PIC = 'https://github.com/ivanlukomskiy/wrecking-talk-miro/blob/main/src/assets/eliminated.png?raw=true'
const BOOM_PIC = 'https://github.com/ivanlukomskiy/wrecking-talk-miro/blob/main/src/assets/boom.png?raw=true'

const {board} = miro;

let previousCreated= null
let created = null

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
        if (text.toLowerCase().startsWith("dick")) {
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

const sayTextProcessor = regexpProcessor(saySmooth, new RegExp('say (.*)', 'i'))
const zoomByNameProcessor = regexpProcessor(zoomByName, new RegExp('zoom on (.*)', 'i'), new RegExp('find (.*)', 'i'))
const addCatProcessor = regexpProcessor(addCat,
    new RegExp('insert cat', 'i'),
    new RegExp('spawn cat', 'i'),
    new RegExp('call kitten', 'i'),
    new RegExp('i hate cats', 'i'),
);
const removeCatProcessor = regexpProcessor(removeCat, new RegExp('remove cat', 'i'));
const decorateProcessor = regexpProcessor(decorate, new RegExp('decorate ?(.*)?', 'i'));
const removeDecorationsProcessor = regexpProcessor(removeDecorations, new RegExp('remove decorations', 'i'));
const removeColorProcessor = regexpProcessor(removeColor, new RegExp('remove color (.*)', 'i'));
const removeByNameProcessor = regexpProcessor(removeByName, new RegExp('delete (.*)', 'i'));

let poopProcessor = regexpProcessor(async (text) => {
    let poo = await board.createText({
        content: "<p style=\"font-size:100px;\">💩</p>", ...await getViewCenter(),
        width: 100
    })
    console.log(poo)
}, new RegExp("(poo)|(poop)|(shit)", "i"))

let createBlockProcessor = regexpProcessor(async (text) => {
    say(`Creating ${text}...`)
    let item = await createShape({
        shape_type: "round_rectangle",
        ...await getViewCenter(),
        title: text,
        strictSpace: false,
        color: "#dddddd"
    })
    previousCreated = created
    created = item
}, new RegExp("create (.*)", "i"))

const paintBlockProcessor = async text => {
    const match = text.match(/paint (.*?) (.*)/)
    if (!match) {
        return
    }
    const blockName = match[1];
    const color = match[2].toLowerCase();

    const blockToPaint = await findByName(blockName);

    blockToPaint.style.fillColor = convert(color);
    await blockToPaint.sync();
}

let linkProcessor = regexpProcessor(async (text) => {
    let selected = await board.getSelection()
    if (selected.length === 0 &&created !== null && previousCreated !== null) {
        selected = [previousCreated, created]
    }
    if (selected.length < 2) {
        return await say("Nothing to link!", 1500)
    }

    async function link(first, second) {
        console.log(first, second)
        let x1, x2, y1, y2
        let a1 = -first.x + second.x + second.y
        let a2 = first.x + second.y - second.x
        let arrow = "right_arrow"
        if (first.y <= a1 && first.y >= a2) {
            y1 = first.y
            y2 = second.y
            x1 = first.x + first.width / 2
            x2 = second.x - second.width / 2
        } else if (first.y <= a1 && first.y <= a2) {
            x1 = first.x
            x2 = second.x
            y1 = first.y + first.height / 2
            y2 = second.y - second.height / 2
        } else if (first.y >= a1 && first.y <= a2) {
            y1 = first.y
            y2 = second.y
            x1 = first.x - first.width / 2
            x2 = second.x + second.width / 2
            arrow = "left_arrow"
        } else if (first.y >= a1 && first.y >= a2) {
            x1 = first.x
            x2 = second.x
            y1 = first.y - first.height / 2
            y2 = second.y + second.height / 2
        }

        let c = x2 - x1
        let Y = y2 - y1
        let angle = Math.atan(Y / c) * 180 / Math.PI
        let width = Math.sqrt(Y * Y + c * c)
        console.log(x1, x2, y1, y2, c, Y, angle, width)
        await board.createShape({
            shape: arrow,
            x: x1 + c / 2,
            y: y1 + Y / 2,
            width: width,
            height: 10,
            rotation: angle
        })
    }

    for (let i = 0; i < selected.length - 1; i++) {
        link(selected[i], selected[i + 1])
    }
}, new RegExp("link", "i"))

let eraseAbstractionProcessor = regexpProcessor(async (text) => {
        for (let item of await board.get()) {
            if (item.content === "dick" || item.content === "nut1" || item.content === "nut2" || item.content === "head") {
                board.remove(item)
            }
        }
    },
    new RegExp("erase abstraction", "i"))


let alignProcessor = regexpProcessor(async (text) => {
    let items = await board.getSelection()
    if (items.length === 0) {
        items = await getInView()
    }
    if (items.length < 2) {
        say("Nothing to align!")
        return
    }
    say("Aligning...")

    function align(items, mainAxis = "x", secondAxis = "y") {
        items = items.sort((x, y) => {
            if (x[mainAxis] < y[mainAxis]) return -1;
            if (x[mainAxis] > y[mainAxis]) return 1;
            return 0;
        })
        let totalWidth = items[items.length - 1][mainAxis] - items[0][mainAxis]
        let window = totalWidth / (items.length - 1)
        let y = items.map(i => i[secondAxis]).reduce((a, b) => a + b) / items.length
        for (let i = 0; i < items.length; i++) {
            items[i][mainAxis] = items[0][mainAxis] + window * i
            items[i][secondAxis] = y
            items[i].sync()
        }
    }

    let xs = items.map(i => i.x);
    let width = Math.max(...xs) - Math.min(...xs)
    let ys = items.map(i => i.y)
    let height = Math.max(...ys) - Math.min(...ys)
    if (width > height) {
        align(items, "x", "y")
    } else {
        align(items, "y", "x")
    }
}, new RegExp("align", "i"))

let zoomOutProcessor = regexpProcessor(async (text) => {
    const objects = await board.get()
    if (objects.length === 0) {
        return;
    }
    let items = await board.get()
    let left = Math.min(...items.map(i => i.x - (i.width ?? 0) / 2))
    let right = Math.max(...items.map(i => i.x + (i.width ?? 0) / 2))
    let top = Math.min(...items.map(i => i.y - (i.height ?? 0) / 2))
    let bottom = Math.max(...items.map(i => i.y + (i.height ?? 0) / 2))
    const vp = await board.viewport.get()
    vp.x = left
    vp.y = top
    vp.width = right - left
    vp.height = bottom - top
    await board.viewport.set({
        viewport: vp,
        padding: {
            top: (top - bottom) * 0.1,
            left: (right - left) * 0.1,
            bottom: (top - bottom) * 0.1,
            right: (right - left) * 0.1,
        },
        animationDurationInMs: 300,
    })
}, new RegExp('show everything', 'i'), new RegExp("zoom out", "i"))

let fireProcessor = regexpProcessor(async (text) => {
    let {x, y, width, height} = await board.viewport.get()
    x = x + width / 2
    y = y + height / 2
    console.log('x, y, width, height', x, y, width, height)
    let promises = [0, 15, 30, 50].map((rotation) => {
        return createImage(FIRES_PIC, x + rotation, y, width, rotation)
    })
    const images = await Promise.all(promises)
    const boom = await createImage(BOOM_PIC, x, y, width / 2)
    let i = 0;
    while (i < 7) {
        for (let image of images) {
            image.rotation = Math.random() * 180;
            image.x = Math.random() * 100 - 50 + x;
            image.y = Math.random() * 100 - 50 + y;
            await image.sync();
        }
        boom.rotation = Math.random() * 50 - 24;
        await boom.sync()
        await sleep(1)
        i++;
    }
    let items = await board.get()
    promises = []
    for (let item of items) {
        promises.push(board.remove(item).catch(() => {
        }))
    }
    await Promise.all(promises)
    let eliminated = await createImage(ELIMINATED_PIC, x, y, width / 2)
    await sleep(3000)
    await board.remove(eliminated)
}, new RegExp("destroy everything", 'i'))

let workspaceProcessor = regexpProcessor(getInView, new RegExp("workspace", "i"))

let renameProcessor = regexpProcessor(async (text) => {
    let selected = await board.getSelection()
    if (selected.length === 0) {
        say("Nothing is selected!")
        return
    }
    if (selected.length > 1) {
        say("More than one object selected!")
        return
    }
    selected[0].content = text
    await selected[0].sync()
}, new RegExp("rename (.*)", "i"), new RegExp("annotate (.*)", "i"))

export const WORD_PROCESSORS = [
    poopProcessor
]

export const PHRASES_PROCESSORS = [
    dickOnSelectedItemProcessor,
    likeBlockProcessor,
    sayTextProcessor,
    zoomByNameProcessor,
    biggerProcessor,
    rickRollProcessor,
    fireProcessor,
    createBlockProcessor,
    linkProcessor,
    eraseAbstractionProcessor,
    addCatProcessor,
    removeCatProcessor,
    alignProcessor,
    paintBlockProcessor,
    workspaceProcessor,
    decorateProcessor,
    zoomOutProcessor,
    removeDecorationsProcessor,
    removeColorProcessor,
    renameProcessor,
    removeByNameProcessor,
]
