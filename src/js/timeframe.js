class TimeFrame {
    constructor(id = "timingFrame", contId = "container") {
        this.frameId = id;
        this.containerId = contId;
        this.message = "";
    }

    get frame() {
        let frame = document.querySelector('#' + this.frameId);
        if (!frame) {
            frame = document.createElement("div");
            frame.id = this.frameId;
            frame.title = "минуты просмотра/лимит";
            frame.style = "border: 1px solid red; border-radius: 10px 50px / 50px; color: green; padding: 2px";
            let cont = document.querySelector('#' + this.containerId);
            cont.insertAdjacentElement("afterbegin", frame);
        }
        return frame;
    }

    set text(text) {
        this.message = text;
        this.frame.innerText = text;
    }

    get text() {
        return this.message;
    }
}