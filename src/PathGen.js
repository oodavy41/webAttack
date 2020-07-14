import anime from "animejs";
import particleShoot from "./particle/ParticleLauncher";
const attackSpeed = 0.02;
function pathGen(THREE, color, trialGen, mask) {
  let spriteTex = null;
  let scene = null;
  let deltaTime = 0;
  return {
    setTex: (tex) => {
      spriteTex = tex;
    },
    genrate: (Scene, p1, p2) => {
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
      let locateSphere = new THREE.SphereGeometry(0.3,8,8);
      let startLocate = new THREE.Mesh(locateSphere, startMat);
      startLocate.position.copy(path[0]);
      startLocate.layers.enable(mask);
        let endLocate = new THREE.Mesh(locateSphere, endMat);
        endLocate.scale.set(1.5,1.5,1.5)
      endLocate.position.copy(path[path.length - 1]);
      endLocate.layers.enable(mask);
      scene.add(startLocate, endLocate);

      let curvePath = new THREE.CatmullRomCurve3(path);
      let curve = new THREE.Mesh(
        new THREE.TubeGeometry(curvePath, path.length * 10, 0.03, 4, false),
        new THREE.MeshLambertMaterial({
          color: "#FFF",
          emissive: color,
          transparent: true,
          opacity: 0.6,
          depthWrite: false,
        })
      );
      curve.layers.enable(mask);
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
        scene
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
      curve.boat = boat;
      curve.update = (t) => {
        curve.anime.tick(t);
        deltaTime = t;
      };
      return curve;
    },

    unload: () => {
      animeThread.pause();
    },
  };
}

export default pathGen;
