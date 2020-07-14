import anime from "animejs";
import particleShoot from "./particle/ParticleLauncher";
import FragFactory from "./textRenderer/fragFactory";

const attackSpeed = 0.02;
function pathGen(THREE, color, trialGen, mask) {
    let spriteTex = null;
    let scene = null;
    let deltaTime = 0;
    let textFactory = new FragFactory();
    return {
        setTex: (tex) => {
            spriteTex = tex;
        },
        genrate: (Scene, p1, p2, p1tex, p2tex) => {
            scene = Scene;
            let path = trialGen.computePath(p1, p2);
            path = path.map((e) => {
                return new THREE.Vector3(e.x, e.y, e.z);
            });

            let endMat = new THREE.MeshLambertMaterial({
                color: "#F00",
                emissive: "#f00",
                transparent: true,
                opacity: 1,
                //   depthWrite: false,
            });
            let startMat = new THREE.MeshLambertMaterial({
                color: "#fff",
                emissive: "#fff",
                transparent: true,
                opacity: 0.8,
                //   depthWrite: false,
            });
            let locateSphere = new THREE.SphereGeometry(0.3, 8, 8);
            let startLocate = new THREE.Mesh(locateSphere, startMat);
            startLocate.position.copy(path[0]);
            startLocate.layers.enable(mask);
            let endLocate = new THREE.Mesh(locateSphere, endMat);
            endLocate.scale.set(1.5, 1.5, 1.5);
            endLocate.position.copy(path[path.length - 1]);
            endLocate.layers.enable(mask);
            scene.add(startLocate, endLocate);

            let curvePath = new THREE.CatmullRomCurve3(path);
            let curve = new THREE.Mesh(
                new THREE.TubeGeometry(
                    curvePath,
                    path.length * 10,
                    0.03,
                    4,
                    false
                ),
                new THREE.MeshLambertMaterial({
                    color: "#FFF",
                    emissive: color,
                    transparent: true,
                    opacity: 0.6,
                    depthWrite: false,
                })
            );
            curve.layers.enable(mask);

            // let startTex = textFactory.frag(curve, p1tex, 14, "#f4f4f4"),
            //     endTex = textFactory.frag(curve, p2tex, 14, "#f4f4f4");
            // startTex.obj.position.set(path[0]);
            // endTex.obj.position.set(path[path.length - 1]);
            // curve.add(startTex.obj, endTex.obj);
            let textFrags = [
                textFactory.frag(p1tex, 44, "#666666").obj,
                textFactory.frag(p2tex, 44, "#666666").obj,
            ];
            textFrags[0].position.copy(path[0]);
            textFrags[1].position.copy(path[path.length - 1]);
            textFrags.forEach((e) => {
                let { x, y, z } = e.position;
                e.position.set(x, y * 1.2, z * 1.3);
                e.visible = false;
            });
            curve.add(...textFrags);
            curve.textFrags = textFrags;

            let boat = new THREE.Sprite(
                new THREE.SpriteMaterial({
                    map: spriteTex,
                    color: "#ff3333",
                    transparent: true,
                    depthWrite: false,
                })
            );
            boat.layers.enable(mask);
            boat.particle = new particleShoot(
                spriteTex,
                spriteTex,
                "#ff3333",
                boat,
                curve
            );

            curve.add(boat);
            path = curvePath.getPoints(curvePath.getLength() * 2);
            let points = path.map((e, i) => {
                let { x, y, z } = e;
                let length = 0;
                if (i !== 0) {
                    let pre = path[i - 1];
                    let dx = pre.x - x;
                    let dy = pre.y - y;
                    let dz = pre.z - z;
                    length = Math.sqrt(dx * dx + dy * dy + dz * dz);
                }
                return { x, y, z, duration: length / attackSpeed };
            });
            let target = points[0];
            curve.anime = anime({
                targets: target,
                keyframes: points,
                loop: true,
                autoplay: false,
                endDelay: 500,
                easing: "linear",
                update: (a) => {
                    boat.position.set(target.x, target.y, target.z + 0.1);
                    boat.particle.update(deltaTime);
                },
            });
            curve.deleteAnime = () => {
                curve.anime.pause();
                anime.remove(target);
                delete curve.anime;
                boat.particle.unmount();
            }
            curve.boat = boat;
            curve.update = (t) => {
                curve.anime.tick(t);
                deltaTime = t;
            };
            return curve;
        },
        onHide: (curve) => {
            curve.position.set(999, 999, 999);
        },
        onShow: (curve) => curve.position.set(0, 0, 0),
        onFocus: (curve) =>
            curve.textFrags.forEach((obj) => (obj.visible = true)),
        onUnFocus: (curve) =>
            curve.textFrags.forEach((obj) => (obj.visible = false)),
        unloadCurve: (curve) => {
            curve.deleteAnime();
        },
        unload: () => {
            textFactory.unmount();
        }
    };
}

export default pathGen;
