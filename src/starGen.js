import * as THREE from "three";
function starGen(radius, size, map, mask) {
    let mat = new THREE.SpriteMaterial({
        color: "#fff",
        // map: map,
        transparent: true,
        opacity: 1,
        depthWrite: false,
    });

    return {
        gen(num) {
            let stars = [];
            for (let i = 0; i < num; i++) {
                let lng = Math.random() * Math.PI,
                    lat = (- Math.random()) * Math.PI;
                let z = Math.sin(lat) * radius,
                    rad = Math.cos(lat) * radius;
                let x = Math.cos(lng) * rad,
                    y = Math.sin(lng) * rad;
                let star = new THREE.Sprite(mat);
                star.scale.set(size, size, size);
                star.position.set(x, y, z);
                star.layers.enable(mask);
                stars.push(star);
            }
            return stars;
        },
    };
}
export default starGen;
