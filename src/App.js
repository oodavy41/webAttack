import React, { Component } from "react";
import * as THREE from "three";
import anime from "animejs";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import customShader from "./shader";

import style from "./App.css";

import Time from "./time";

import rotateCtrl from "./rotateCtrl";
import zoomCtrl from "./zoomCtrl";
import trialGen from "./trialGen";
import pathGen from "./pathGen";
import starGen from "./starGen";
import InfoPanel from "./infoPanel";

import globeMap from "./img/hologram-map.svg";
import globeMapFull from "./img/hologram-map2.svg";
import spaceMap from "./img/space.jpg";
import globeNightMap from "./img/earthNightMap.jpg";
import globeNightNormalMap from "./img/earthNormalMap.jpg";
import steamIcon from "./img/steam.png";
import haloIcon from "./img/spot.png";
import space1Map from "./img/space1.jpg";
// import Compoment
const customPath = "custom/three_webAttack";
const defaultData = ["0.5"];
const backgroundColor = "#000";
const haloSize = 120;
const sunLightStrength = 12;
const ambientLightColor = "#606060";
const pathColor = "#66aaff";
const cameraPos = 65;
const globeScale = 1.2;
const globeSize = 30;
const STATIC_SCENE = 0,
    CYBER_SCENE = 1;
let attacks = [
    {
        type: "DDOS攻击",
        country: "美国",
        sender: "纽约",
        aim: "上海",
        path: [
            [41.942268, -72.59585],
            [31.997755, 120.0604],
        ],
    },
    {
        type: "跨站脚本攻击",
        country: "俄罗斯",
        sender: "莫斯科",
        aim: "北京",
        path: [
            [55, 37],
            [38.47217, 115.426287],
        ],
    },
    {
        type: "跨站脚本攻击",
        country: "俄罗斯",
        sender: "莫斯科",
        aim: "上海",
        path: [
            [55, 37],
            [31.997755, 120.0604],
        ],
    },
    {
        type: "DNS劫持攻击",
        country: "英国",
        sender: "伦敦",
        aim: "上海",
        path: [
            [51.884358, -2.171369],
            [31.997755, 120.0604],
        ],
    },
    {
        type: "DNS劫持攻击",
        country: "印度",
        sender: "莱布尔",
        aim: "北京",
        path: [
            [21.36265, 83.785662],
            [38.47217, 115.426287],
        ],
    },
    {
        type: "跨站脚本攻击",
        country: "澳大利亚",
        sender: "墨尔本",
        aim: "上海",
        path: [
            [-28.698683, 151.637225],
            [31.997755, 120.0604],
        ],
    },
];
attacks = attacks.map((e) => {
    let date = new Date().getTime() - Math.random() * 1000 * 3600 * 24 * 30;
    let ipGen = () => Math.floor(Math.random() * 256);
    let senderIP = `${ipGen()}.${ipGen()}.${ipGen()}.${ipGen()}`;
    let aimIP = `${ipGen()}.${ipGen()}.${ipGen()}.${ipGen()}`;
    return { ...e, time: new Date(date).toLocaleString(), aimIP, senderIP };
});

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pickedNode: null,
        };
        this.div = null;
        this.animeId = null;
        this.disposeThrees = null;
    }

    componentDidMount() {
        let dataProvider = this.props.dataProvider || defaultData;
        this.rotation = rotateCtrl();
        this.zoom = zoomCtrl(globeScale);
        this.trialGen = trialGen(globeSize, 1.1);
        this.pathGen = pathGen(THREE, pathColor, this.trialGen, CYBER_SCENE);
        this.curves = null;
        let darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
        let materials = {};
        let bloomLayer = new THREE.Layers();
        bloomLayer.set(CYBER_SCENE);

        let worldTex = new THREE.TextureLoader().load(globeMap);
        let worldTexFull = new THREE.TextureLoader().load(globeMapFull);
        // worldTex.minFilter = THREE.LinearMipMapNearestFilter;
        // worldTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        let worldNightTex = new THREE.TextureLoader().load(globeNightMap);
        let worldNormal = new THREE.TextureLoader().load(globeNightNormalMap);
        let spaceTex = new THREE.TextureLoader().load(
            dataProvider[1] ? customPath + dataProvider[1] : space1Map
        );
        let spriteTex = new THREE.TextureLoader().load(steamIcon);
        this.pathGen.setTex(spriteTex);
        let haloMap = new THREE.TextureLoader().load(haloIcon);
        // resource ================================================= render
        let widthHeightRate = 16 / 9;
        var scene = new THREE.Scene();
        // scene.fog = new THREE.Fog("#333333", 120, 240);
        // var camera = new THREE.PerspectiveCamera(
        //     75,
        //     widthHeightRate,
        //     0.1,
        //     10000
        // );
        let orthoSize = 2;
        var camera = new THREE.OrthographicCamera(
            -orthoSize * globeSize * widthHeightRate,
            orthoSize * globeSize * widthHeightRate,
            orthoSize * globeSize,
            -orthoSize * globeSize,
            1,
            1000
        );

        var renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            premultipliedAlpha: true,
        });
        renderer.toneMapping = THREE.ReinhardToneMapping;
        // renderer.setClearColor(backgroundColor);
        // renderer.setClearAlpha(0.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(this.div.clientWidth, this.div.clientHeight);
        this.div.appendChild(renderer.domElement);

        renderer.domElement.addEventListener("mousemove", this.rotation.onMove);
        renderer.domElement.addEventListener(
            "mousedown",
            this.rotation.onMouseDown
        );
        renderer.domElement.addEventListener(
            "mouseup",
            this.rotation.onMouseUp
        );
        renderer.domElement.addEventListener("wheel", this.zoom.onWheel);
        renderer.domElement.addEventListener("dblclick", this.rotation.onPause);

        let Light = new THREE.DirectionalLight("#fff", sunLightStrength);
        Light.position.set(-30, 20, -3);
        Light.lookAt(30, -20, 3);
        scene.add(Light);
        scene.add(new THREE.AmbientLight(ambientLightColor));

        let renderScene = new RenderPass(scene, camera);

        let bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight)
        );
        bloomPass.threshold = 0.16;
        bloomPass.strength = 3;
        bloomPass.radius = 0;

        let bloomComposer = new EffectComposer(renderer);
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass(renderScene);
        bloomComposer.addPass(bloomPass);

        let finalPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: {
                        value: bloomComposer.renderTarget2.texture,
                    },
                },
                vertexShader: customShader.vert,
                fragmentShader: customShader.frag,
                defines: {},
            }),
            "baseTexture"
        );
        finalPass.needsSwap = true;

        let finalComposer = new EffectComposer(renderer);
        finalComposer.addPass(renderScene);
        finalComposer.addPass(finalPass);

        //render ================================================= model
        let globe = new THREE.Object3D();

        var geoout = new THREE.OctahedronGeometry(globeSize, 5);
        geoout.computeFaceNormals();
        geoout.computeVertexNormals();
        var matout = new THREE.MeshPhongMaterial({
            emissive: "#012",
            emissiveMap: worldTexFull,
            map: worldNightTex,
            normalMap: worldNormal,
            alphaMap: worldTexFull,
            transparent: true,
            depthWrite: false,
            opacity: 1,
        });
        var sphereout = new THREE.Mesh(geoout, matout);
        var matin = new THREE.MeshBasicMaterial({
            map: worldTex,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
        });
        var spherein = new THREE.Mesh(geoout, matin);
        sphereout.add(spherein);

        let curves = attacks.map((node) => {
            let e = node.path;
            return this.pathGen.genrate(
                globe,
                [e[0][1], e[0][0]],
                [e[1][1], e[1][0]],
                node.sender,
                node.aim
            );
        });
        this.curves = curves;

        let backgroundHalo = new THREE.Sprite(
            new THREE.SpriteMaterial({
                color: "#fff",
                map: haloMap,
                transparent: true,
                opacity: 0.3,
                depthWrite: false,
            })
        );
        backgroundHalo.position.set(0, 0, -90);
        backgroundHalo.layers.enable(CYBER_SCENE);
        scene.add(backgroundHalo);

        let backgroundMap = new THREE.Sprite(
            new THREE.SpriteMaterial({
                color: "#fff",
                map: spaceTex,
                // transparent: true,
                opacity: +dataProvider[0],
                depthWrite: false,
            })
        );
        backgroundMap.scale.set(288 * 0.8, 162 * 0.8);
        backgroundMap.position.set(30, 0, -200);
        scene.add(backgroundMap);

        let globeMask = new THREE.Mesh(
            new THREE.CircleGeometry(globeSize, 64),
            new THREE.MeshBasicMaterial({
                color: "#222",
                transparent: true,
                opacity: 0.2,
                depthWrite: false,
            })
        );
        globeMask.position.set(0, 0, 0);
        scene.add(globeMask);

        scene.add(...starGen(300, 0.3, haloMap, CYBER_SCENE).gen(600));

        sphereout.rotateY(Math.PI);
        globe.add(sphereout);
        globe.add(...curves);
        scene.add(globe);

        //===================================
        let animate = (t) => {
            camera.position.set(30, 0, cameraPos);
            let scale = this.zoom.value();
            globe.scale.set(scale, scale, scale);
            globeMask.scale.set(scale, scale, scale);
            scale = (scale - 1) * 0.5 + 1;
            backgroundHalo.scale.set(
                scale * haloSize,
                scale * haloSize,
                scale * haloSize
            );
            let { x, y } = this.rotation.get();
            globe.rotation.set(y, x, 0);
            curves.forEach((e) => {
                e.update(t);
            });
            this.rotation.update(t);

            scene.traverse((obj) => {
                if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
                    materials[obj.uuid] = obj.material;
                    obj.material = darkMaterial;
                }
            });
            bloomComposer.render();
            scene.traverse((obj) => {
                if (materials[obj.uuid]) {
                    obj.material = materials[obj.uuid];
                    delete materials[obj.uuid];
                }
            });
            finalComposer.render();
            requestAnimationFrame(animate);
        };
        this.animeId = requestAnimationFrame(animate);

        this.disposeThrees = () => {
            darkMaterial.dispose();
            worldTex.dispose();
            worldTexFull.dispose();
            worldNightTex.dispose();
            worldNormal.dispose();
            spaceTex.dispose();
            spriteTex.dispose();
            haloMap.dispose();
            scene.dispose();
            renderer.forceContextLoss();
            renderer.dispose();
            renderer = null;
        };
    }

    componentDidUpdate() {}

    componentWillUnmount() {
        if (this.curves) {
            for (let i = 0; i < this.curves.length; i++) {
                let curve = this.curves[i];
                this.pathGen.unloadCurve(curve);
            }
            delete this.curves;
        }
        this.pathGen.unload();
        cancelAnimationFrame(this.animeId);
        delete this.rotation;
        delete this.zoom;
        delete this.trialGen;
        delete this.pathGen;
        this.disposeThrees();
    }

    render() {
        let { pickedNode } = this.state;
        return (
            <div
                ref={(m) => (this.div = m)}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            >
                {/* <h2 className={`${style.head}`}>外部攻击实时防御情况</h2>
                <Time customClass={`${style.timer}`}></Time> */}
                {pickedNode && <InfoPanel data={pickedNode}></InfoPanel>}
                <div className={`${style.panel}`}>
                    <div className={`${style.cell}`}>
                        <div className={`${style.title}`}>
                            当日恶意代码攻击事件数
                        </div>
                        <div className={`${style.count}`}>
                            {attacks.length}个
                        </div>
                    </div>
                    <div
                        className={`${style.cell}  ${style.subCell} ${style.defSuccess}`}
                    >
                        <div className={`${style.subTitle}`}>
                            当日攻击事件防御成功率
                        </div>
                        <div className={`${style.value}`}>100%</div>
                    </div>
                    <div className={`${style.cell}`}>
                        <table className={`${style.table}`}>
                            {attacks.map((e, i) => (
                                <tr
                                    key={e.type + e.sender + e.aim}
                                    onClick={() => {
                                        this.setState({
                                            pickedNode: attacks[i],
                                        });
                                        this.curves.forEach((c, ci) => {
                                            this.pathGen.onShow(c);
                                            if (ci === i) {
                                                this.pathGen.onFocus(c);
                                            } else {
                                                this.pathGen.onHide(c);
                                            }
                                        });

                                        this.rotation.focus(
                                            this.curves[i],
                                            () => {
                                                this.setState({
                                                    pickedNode: null,
                                                });
                                                this.curves.forEach((c) => {
                                                    this.pathGen.onShow(c);
                                                    this.pathGen.onUnFocus(c);
                                                });
                                            }
                                        );
                                    }}
                                >
                                    <td className={`${style.tableTd}`}>
                                        <div className={`${style.attack_type}`}>
                                            {e.time}
                                        </div>
                                        <div className={`${style.attack_type}`}>
                                            {e.type}
                                        </div>
                                        <div className={`${style.attack_aim}`}>
                                            {e.sender} > {e.aim}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}
