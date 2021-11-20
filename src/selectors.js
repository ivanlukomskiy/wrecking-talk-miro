const {board} = window.miro;

export async function findByName(name) {
    name = name.toLowerCase()
    console.log("looking for", name)
    let item = (await board.get()).filter(value => {
        if(!value.content) {
            console.log('Item without content', value)
            return false;
        }
        console.log(value.content.toLowerCase().indexOf(name) !== -1, value)
        return value.content.toLowerCase().indexOf(name) !== -1
    })
    if (item.length === 0) {
        return null
    }
    return item[0]
}
export async function changeColor(item, color) {
    item.style.fillColor = color
    await item.sync()
}
export async function getSelectedRect() {
    let x = Infinity
    let y = Infinity
    let right = -Infinity
    let bottom = -Infinity
    // console.log(await board.getSelection())
    let selection = await board.getSelection();
    if (selection.length === 0) {
        return null
    }
    for (const item of selection) {
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

export async function getViewCenter() {
    let vp = await board.viewport.get()
    return {
        x: vp.x + vp.width / 2 - 150,
        y: vp.y + vp.height / 2
    }
}