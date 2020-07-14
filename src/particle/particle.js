import * as THREE from "three";
import anime from "animejs";

export default class particle {
    constructor(scene, material, launcher) {
        this.sprite = new THREE.Sprite(material);
        this.anime = null;
        this.alive = false;
        this.launcher = launcher;
        this.scene = scene;
        scene.add(this.sprite);
    }
    update(t) {
        // console.log("particle", this.anime.currentTime);
        !this.anime.completed && this.anime.tick(t);
    }

    unmount() {
        this.anime.pause();
        delete this.anime;
    }
    aweak(parent, opt) {
        // console.log("aweak", opt);
        this.anime && this.anime.pause();
        this.alive = true;
        // let pos = new THREE.Vector3();
        // this.launcher.getWorldPosition(pos);
        this.sprite.position.copy(parent.position);
        this.sprite.visible = true;
        this.sprite.layers = parent.layers;
        let t = { start: opt.start * 100 };
        if (this.anime) {
            this.anime.restart();
        } else {
            this.anime = anime({
                targets: t,
                start: opt.end * 100,
                round: 1,
                autoplay: false,
                easing: "easeOutExpo",
                duration: opt.life,
                update: (a) => {
                    let _t = (t.start + 1) / 100;
                    this.sprite.scale.set(_t, _t, _t);
                },
                complete: (a) => {
                    this.alive = false;
                    this.sprite.visible = false;
                },
            });
        }
        return this;
    }
}
