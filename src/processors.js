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
    decorate
} from "./commands";

const FIRES_PIC = 'https://github.com/ivanlukomskiy/wrecking-talk-miro/blob/main/src/assets/fires.png?raw=true'
const ELIMINATED_PIC = 'https://github.com/ivanlukomskiy/wrecking-talk-miro/blob/main/src/assets/eliminated.png?raw=true'
const BOOM_PIC = 'https://github.com/ivanlukomskiy/wrecking-talk-miro/blob/main/src/assets/boom.png?raw=true'

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
const addCatProcessor = regexpProcessor(addCat, new RegExp('insert cat', 'i'), new RegExp('spawn cat', 'i'));
const removeCatProcessor = regexpProcessor(removeCat, new RegExp('remove cat', 'i'));
const decorateProcessor = regexpProcessor(decorate, new RegExp('decorate ?(.*)?', 'i'));

let poopProcessor = regexpProcessor(async (text) => {
    let poo = await board.createText({
        content: "<p style=\"font-size:100px;\">💩</p>", ...await getViewCenter(),
        width: 100
    })
    console.log(poo)
}, new RegExp("(poo)|(poop)|(shit)", "i"))

let createBlockProcessor = regexpProcessor(async (text) => {
    say(`Creating ${text}...`)
    await board.createShape({
        shape: "rectangle",
        ...await getViewCenter(),
        content: text
    })
}, new RegExp("create (.*)", "i"))

function convert(color) {
    var colours = {
        "aliceblue": "#f0f8ff",
        "antiquewhite": "#faebd7",
        "aqua": "#00ffff",
        "aquamarine": "#7fffd4",
        "azure": "#f0ffff",
        "beige": "#f5f5dc",
        "bisque": "#ffe4c4",
        "black": "#000000",
        "blanchedalmond": "#ffebcd",
        "blue": "#0000ff",
        "blueviolet": "#8a2be2",
        "brown": "#a52a2a",
        "burlywood": "#deb887",
        "cadetblue": "#5f9ea0",
        "chartreuse": "#7fff00",
        "chocolate": "#d2691e",
        "coral": "#ff7f50",
        "cornflowerblue": "#6495ed",
        "cornsilk": "#fff8dc",
        "crimson": "#dc143c",
        "cyan": "#00ffff",
        "darkblue": "#00008b",
        "darkcyan": "#008b8b",
        "darkgoldenrod": "#b8860b",
        "darkgray": "#a9a9a9",
        "darkgreen": "#006400",
        "darkkhaki": "#bdb76b",
        "darkmagenta": "#8b008b",
        "darkolivegreen": "#556b2f",
        "darkorange": "#ff8c00",
        "darkorchid": "#9932cc",
        "darkred": "#8b0000",
        "darksalmon": "#e9967a",
        "darkseagreen": "#8fbc8f",
        "darkslateblue": "#483d8b",
        "darkslategray": "#2f4f4f",
        "darkturquoise": "#00ced1",
        "darkviolet": "#9400d3",
        "deeppink": "#ff1493",
        "deepskyblue": "#00bfff",
        "dimgray": "#696969",
        "dodgerblue": "#1e90ff",
        "firebrick": "#b22222",
        "floralwhite": "#fffaf0",
        "forestgreen": "#228b22",
        "fuchsia": "#ff00ff",
        "gainsboro": "#dcdcdc",
        "ghostwhite": "#f8f8ff",
        "gold": "#ffd700",
        "goldenrod": "#daa520",
        "gray": "#808080",
        "green": "#008000",
        "greenyellow": "#adff2f",
        "honeydew": "#f0fff0",
        "hotpink": "#ff69b4",
        "indianred ": "#cd5c5c",
        "indigo": "#4b0082",
        "ivory": "#fffff0",
        "khaki": "#f0e68c",
        "lavender": "#e6e6fa",
        "lavenderblush": "#fff0f5",
        "lawngreen": "#7cfc00",
        "lemonchiffon": "#fffacd",
        "lightblue": "#add8e6",
        "lightcoral": "#f08080",
        "lightcyan": "#e0ffff",
        "lightgoldenrodyellow": "#fafad2",
        "lightgrey": "#d3d3d3",
        "lightgreen": "#90ee90",
        "lightpink": "#ffb6c1",
        "lightsalmon": "#ffa07a",
        "lightseagreen": "#20b2aa",
        "lightskyblue": "#87cefa",
        "lightslategray": "#778899",
        "lightsteelblue": "#b0c4de",
        "lightyellow": "#ffffe0",
        "lime": "#00ff00",
        "limegreen": "#32cd32",
        "linen": "#faf0e6",
        "magenta": "#ff00ff",
        "maroon": "#800000",
        "mediumaquamarine": "#66cdaa",
        "mediumblue": "#0000cd",
        "mediumorchid": "#ba55d3",
        "mediumpurple": "#9370d8",
        "mediumseagreen": "#3cb371",
        "mediumslateblue": "#7b68ee",
        "mediumspringgreen": "#00fa9a",
        "mediumturquoise": "#48d1cc",
        "mediumvioletred": "#c71585",
        "midnightblue": "#191970",
        "mintcream": "#f5fffa",
        "mistyrose": "#ffe4e1",
        "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead",
        "navy": "#000080",
        "oldlace": "#fdf5e6",
        "olive": "#808000",
        "olivedrab": "#6b8e23",
        "orange": "#ffa500",
        "orangered": "#ff4500",
        "orchid": "#da70d6",
        "palegoldenrod": "#eee8aa",
        "palegreen": "#98fb98",
        "paleturquoise": "#afeeee",
        "palevioletred": "#d87093",
        "papayawhip": "#ffefd5",
        "peachpuff": "#ffdab9",
        "peru": "#cd853f",
        "pink": "#ffc0cb",
        "plum": "#dda0dd",
        "powderblue": "#b0e0e6",
        "purple": "#800080",
        "rebeccapurple": "#663399",
        "red": "#ff0000",
        "rosybrown": "#bc8f8f",
        "royalblue": "#4169e1",
        "saddlebrown": "#8b4513",
        "salmon": "#fa8072",
        "sandybrown": "#f4a460",
        "seagreen": "#2e8b57",
        "seashell": "#fff5ee",
        "sienna": "#a0522d",
        "silver": "#c0c0c0",
        "skyblue": "#87ceeb",
        "slateblue": "#6a5acd",
        "slategray": "#708090",
        "snow": "#fffafa",
        "springgreen": "#00ff7f",
        "steelblue": "#4682b4",
        "tan": "#d2b48c",
        "teal": "#008080",
        "thistle": "#d8bfd8",
        "tomato": "#ff6347",
        "turquoise": "#40e0d0",
        "violet": "#ee82ee",
        "wheat": "#f5deb3",
        "white": "#ffffff",
        "whitesmoke": "#f5f5f5",
        "yellow": "#ffff00",
        "yellowgreen": "#9acd32"
    };

    if (typeof colours[color.toLowerCase()] != 'undefined')
        return colours[color.toLowerCase()];
    return false;
}

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
    if (selected.length === 0) {
        selected = await getInView()
    }
    if (selected.length < 2) {
        return await say("Nothing to link!", 1500)
    }

    async function link(first, second) {
        console.log(first, second)
        let x1, x2, y1 ,y2
        let a1 = -first.x + second.x + second.y
        let a2 = first.x + second.y - second.x
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
        } else if (first.y >= a1 && first.y <= a2 ) {
            y1 = first.y
            y2 = second.y
            x1 = first.x - first.width / 2
            x2 = second.x + second.width / 2
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
            shape: "right_arrow",
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

let zoomOutProcessor = regexpProcessor(async(text) => {
    const objects = await board.get()
    if (objects.length === 0) {
        return;
    }
    let items = await board.get()
    let left = Math.min(...items.map(i => i.x - i.width / 2))
    let right = Math.max(...items.map(i => i.x + i.width / 2))
    let top = Math.min(...items.map(i => i.y - i.height / 2))
    let bottom = Math.max(...items.map(i => i.y + i.height / 2))

    const vp = await board.viewport.get()
    vp.x = left
    vp.y = top
    vp.width = right - left
    vp.height = bottom - top
    await board.viewport.set({
        viewport: vp,
        padding: {
            top: (top - bottom) * 0.05,
            left: (right - left) * 0.05,
            bottom: (top - bottom) * 0.05,
            right: (right - left) * 0.05,
        },
        animationDurationInMs: 300,
    })
}, new RegExp('show everything', 'i'), new RegExp("zoom out", "i"))

let fireProcessor = regexpProcessor(async (text) => {
    let {x, y, width, height} = await board.viewport.get()
    x = x + width / 2
    y = y + height /2
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
]
