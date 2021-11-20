import {findByCoords, findByName} from "./selectors";
import {convert} from "./colorsMap";

const {board} = window.miro;
const FLOWER_URLS = [
    'https://github.com/ivanlukomskiy/wrecking-talk-miro/blob/main/src/assets/flower1.png?raw=true',
    'https://github.com/ivanlukomskiy/wrecking-talk-miro/blob/main/src/assets/flower2.png?raw=true',
    'https://github.com/ivanlukomskiy/wrecking-talk-miro/blob/main/src/assets/flower3.png?raw=true',
]
const CAT_URLS = [
    'https://raw.githubusercontent.com/ivanlukomskiy/wrecking-talk-miro/main/src/assets/cat1.png?raw=true',
    'https://raw.githubusercontent.com/ivanlukomskiy/wrecking-talk-miro/main/src/assets/cat3.png?raw=true',
]

export async function createShape({shape_type, title = "", x = 0, y = 0, width = 100, height = 100, color = "transparent", strictSpace = true}) {
    if (!strictSpace) {
        let item = await findByCoords(x ,y)
        while (item !== undefined) {
            x = item.x + item.width / 2 + 100
            item = await findByCoords(x, y)
        }
    }
    return await board.createShape({
        "content": title,
        "shape": shape_type,
        "style": {
            "fillColor": color
        },
        "x": x,
        "y": y,
        "width": width,
        "height": height
    })
}

export async function createImage(url, x, y, width, rotation=0.0, title = 'This is an image') {
    const params = {
        title,
        url,
        x,
        y,
        width,
        rotation
    }
    console.log('params', params)
    return await miro.board.createImage(params)
}

export async function createText(content, x, y, width, color=null) {
    const props = {
        content,
        x,
        y,
        width,
        rotation: 0.0,
    }
    if(color) {
        props['style'] = {
            fillColor: color
        }
    }
    return await miro.board.createText(props)
}

export async function drawAbstraction(x = 0, y = 0, length = 300, color = "#000000") {
    await Promise.all([
        createShape({
            shape_type: "circle",
            title: "head",
            x: x + length,
            y: y + 50,
            color: color
        }),
        createShape({
            shape_type: "rectangle",
            title: "dick",
            x: x + length / 2,
            y: y + 50,
            width: length,
            color: color
        }),
        createShape({
            shape_type: "circle",
            title: "nut1",
            x,
            y,
            color: color
        }),
        createShape({
            shape_type: "circle",
            title: "nut2",
            x,
            y: y + 100,
            color: color
        }),])
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export async function say(text, timeout = 1500, x=null, y=null) {
    console.log("saying:", text, "for", timeout)
    const vp = await board.viewport.get()
    const popup = await createShape(
        {
            shape_type: "wedge_round_rectangle_callout",
            x: x ?? (vp.x + vp.width / 4),
            y: y ?? (vp.y + vp.height * 3 / 4),
            title: `<strong>${capitalizeFirstLetter(text)}</strong>`,
            color: "#dddddd"
        }
    )
    setTimeout(() => {
        board.remove(popup)
    }, timeout)
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function saySmooth(text, timeout = 2000, pause = 1,) {
    const vp = await board.viewport.get()
    text = capitalizeFirstLetter(text).split(" ")
    const popup = await createShape(
        {
            shape_type: "wedge_round_rectangle_callout",
            x: vp.x + vp.width / 4,
            y: vp.y + vp.height * 3 / 4,
            title: "",
            color: "#bbbbbb"
        }
    )

    async function smooth(pos) {

        if (pos < text.length) {
            popup.content = `<strong>${text.slice(0, pos + 1).join(" ")}</strong>`
            await popup.sync()
            setTimeout(async () => {
                await smooth(pos + 1)
            }, pause)
        } else {
            await sleep(timeout)
            await board.remove(popup)
        }
    }

    await smooth(0)
    // for (let i =0; i < text.length; i++) {
    //     setTimeout(() => {
    //         popup.content = `<strong>${text.substr(0, i)}</strong>`
    //         popup.sync()
    //     }, pause * i)
    // }
    // setTimeout(() => {
    //     board.remove(popup)
    // }, timeout + pause * text.length)
}

export async function zoomByName(name) {
    const item = await findByName(name)
    if (item !== null) {
        await board.viewport.zoomTo(item)
    }

}

function chooseFlowerCoords(x, y, width, height) {
    let xmin = width / 2.6
    let ymin = height / 2.6
    let x1, y1
    while(true) {
        x1 = (Math.random()-0.5) * width
        y1 = (Math.random()-0.5) * height
        if ((x1 < -xmin || x1 > xmin) || (y1 < -ymin || y1 > ymin)) {
            break;
        }
    }
    return {x: x1 + x, y: y1 + y, width: width/7, height: width/7}
}

export const decorateItem = async item => {
    if (!item) {
        return
    }

    await item.sync();
    const promises = []

    const {x, y, width, height} = item;
    for(let flowerIdx = 0; flowerIdx<FLOWER_URLS.length; flowerIdx++) {
        for (let i = 0; i <= 7; i++) {
            const coords = chooseFlowerCoords(x,y,width,height)
            promises.push(createImage(FLOWER_URLS[flowerIdx], coords['x'], coords['y'], coords['width'], height['height'], 'decoration'))
        }
    }
    await Promise.all(promises)
}

export const decorate = async text => {
    if (!text) {
        const items = await board.getSelection();
        if (items && items.length) {
            await Promise.all(items.map(decorateItem))
        }
    }

    const item = await findByName(text)
    await decorateItem(item)
}

const CAT_STEP = 5;
async function goCat(cat0, cat1) {
    cat0.x += CAT_STEP
    cat1.x += CAT_STEP
    await cat0.sync()
    await cat1.sync()
}

export async function addCat() {
    const vp = await board.viewport.get();
    const x = vp.x + vp.width / 4;
    const y = vp.y + vp.height * 3 / 4;

    const w = 166;

    const cat0 = await createImage(CAT_URLS[0], x, y, w, 0, 'cat0')
    const cat1 = await createImage(CAT_URLS[1], x, y, w, 0, 'cat1')
    var tick = 1
    while (true) {
        await goCat(cat0, cat1)
        await board.bringToFront(cat0);
        await sleep(30)
        await goCat(cat0, cat1)
        await board.bringToFront(cat1);
        if (tick % 3 === 0) {
            say('meaw', 1500, cat0.x + cat0.width / 2, cat0.y - cat0.height)
        }
        await sleep(30)
        tick++;
    }
}

export async function findByTitle(title) {
    return (await board.get()).find(item => item.title === title)
}

export async function findAllByTitle(title) {
    return (await board.get()).filter(item => item.title === title)
}

export async function removeAll(arr) {
    await Promise.all(arr.map(async el => await board.remove(el)))
}

export async function removeCat() {
    const cats = await Promise.all([...(await findAllByTitle('cat0')), ...(await findAllByTitle('cat1'))]);
    await removeAll(cats)
}

export async function removeDecorations() {
    const decorations = await findAllByTitle('decoration');
    await removeAll(decorations);
}

export async function removeColor(color) {
    const items = (await board.get()).filter(item => item.style && item.style.fillColor === convert(color));
    await removeAll(items);
}
