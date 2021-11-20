const {board} = window.miro;

export function createShape({shape_type, title = "", x = 0, y = 0, width = 100, height = 100, color = "f000000"}) {
    return {
        "content": title,
        "shape": shape_type,
        "style": {
            "fillColor": color
        },
        "x": x,
        "y": y,
        "width": width,
        "height": height

    }
}

export async function drawAbstraction(x = 0, y = 0, length = 300, color = "#000000") {
    await Promise.all([
        board.createShape(createShape({
            shape_type: "circle",
            title: "head",
            x: x + length,
            y: y + 50,
            color: color
        })),
        board.createShape(createShape({
            shape_type: "rectangle",
            title: "dick",
            x: x + length / 2,
            y: y + 50,
            width: length,
            color: color
        })),
        board.createShape(createShape({
            shape_type: "circle",
            title: "nut1",
            x,
            y,
            color: color
        })),
        board.createShape(createShape({
            shape_type: "circle",
            title: "nut2",
            x,
            y: y + 100,
            color: color
        })),])
}
