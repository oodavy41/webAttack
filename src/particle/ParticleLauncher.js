import * as THREE from "three";
import particle from "./particle";

export default class particleLauncher extends THREE.Object3D {
    constructor(texture, alphaMap, color, parent, scene, options = {}) {
        super();
        this.texture = texture;
        this.alphaMap = alphaMap;
        this.color = color;
        this.parent = parent;
        this.scene = scene;
        this.option = {
            start: 1,
            end: 0.1,
            delta: 10,
            life: 1000,
        };
        Object.assign(this.option, options);
        this.last = null;
        this.popQueue = [];
    }

    update(t) {
        // console.log("launcher", this.popQueue);
        if (!this.last) {
            this.fire();
            this.last = t;
        } else {
            let now = t;
            let delta = now - this.last;
            if (this.option.delta && delta > this.option.delta) {
                this.last = now;
                this.fire();
            }
            this.popQueue.forEach((p) => p.alive && p.update(t));
        }
    }

    unmount() {
        this.popQueue.forEach((p) => {
            p.unmount();
        });
        delete this.popQueue;
        delete this.texture;
        delete this.alphaMap;
        delete this.parent;
        delete this.scene;
    }

    fire() {
        if (
            this.popQueue.length === 0 ||
            (this.popQueue[0].alive && this.popQueue.length < 100)
        ) {
            this.popQueue.push(
                new particle(
                    this.scene,
                    new THREE.SpriteMaterial({
                        map: this.texture,
                        alphaMap: this.alphaMap,
                        color: this.color,
                        transparent: true,
                        opacity: 0.8,
                    }),
                    this,
                    this.parent
                ).aweak(this.parent, this.option)
            );
        } else {
            this.popQueue.push(
                this.popQueue.shift().aweak(this.parent, this.option)
            );
        }
    }
}
