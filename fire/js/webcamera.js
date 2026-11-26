class WebCamera {

    constructor(container) {
        this.container = container;
        this.video = null;
        this.stream = null;

        // La máscara ya dispone de un elemento video: usarlo directamente.
        const existing = container instanceof HTMLVideoElement;
        this.video = existing ? container : document.createElement("video");
        if (!existing) {
            this.container.classList.add("position-relative");
            this.container.style.position = "relative";
            this.container.prepend(this.video);
        }
        this.video.autoplay = true;
        this.video.playsInline = true;
        this.video.muted = true;
        Object.assign(this.video.style, {
            position: "absolute", inset: "0", width: "100%", height: "100%",
            objectFit: "cover", transform: "scaleX(-1)", zIndex: "0"
        });
    }

    async startCamera(deviceId = null) {

        if (this.stream) { this.stream.getTracks().forEach(track => track.stop()); }

        const constraints = {
            video: deviceId
                ? { deviceId: { exact: deviceId } }
                : { facingMode: "user" }
        };

        // this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                frameRate: { ideal: 30, max: 30 },
                facingMode: "user"
            }
        });
        this.video.srcObject = this.stream;
        await this.video.play();
    }

    async getCameras() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(d => d.kind === "videoinput");
    }

    async changeCamera(deviceId) { await this.startCamera(deviceId); }
}

export { WebCamera };
export default WebCamera;