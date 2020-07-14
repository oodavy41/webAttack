import * as Ease from "d3-ease";

function trailGen(raidus, flytimes = 1.1) {
    const height = raidus * flytimes;

    function sphereAbs(value) {
        value = Math.abs(value);
        if (value > 180) {
            return Math.abs(value - 360);
        } else {
            return value;
        }
    }
    function interpolation(a, b, rate, direction = true) {
        let ease = direction ? Ease.easeCircleOut : Ease.easeCircleIn;
        let r = ease(rate);
        let ret = {
            x: a.x * (1 - rate) + b.x * rate,
            y: a.y * (1 - rate) + b.y * rate,
            z: a.z * (1 - r) + b.z * r,
        };
        return ret;
    }
    function transform({ x, y, z }) {
        let rad = Math.cos((y / 180) * Math.PI) * z;
        let x3 = Math.cos((x / 180) * Math.PI) * rad;
        let z3 = -Math.sin((x / 180) * Math.PI) * rad;
        let y3 = Math.sin((y / 180) * Math.PI) * z;
        console.log("before：", x, y, z);
        console.log("after:", x3, y3, z3);
        return { x: x3, y: y3, z: z3 };
    }
    return {
        computePath(p1, p2) {
            console.log("input", p1, p2);
            let start = { x: p1[0], y: p1[1], z: raidus },
                end = { x: p2[0], y: p2[1], z: raidus };
            let midxa = (p1[0] + p2[0]) / 2;
            let midxb = midxa + 180;
            let midx =
                sphereAbs(p1[0] - midxa) < sphereAbs(p1[0] - midxb)
                    ? midxa
                    : midxb;
            let gama =
                (Math.min(
                    Math.abs(p1[0] - p2[0]),
                    360 - Math.abs(p1[0] - p2[0])
                ) /
                    180) *
                Math.PI;
            let h_a = Math.sin((p1[1] / 180) * Math.PI),
                h_b = Math.sin((p2[1] / 180) * Math.PI),
                h_delta = Math.abs(h_a - h_b);
            // console.log("Heights", h_a, h_b, h_delta);
            let equatorialA = Math.cos((p1[1] / 180) * Math.PI),
                equatorialB = Math.cos((p2[1] / 180) * Math.PI);
            let compute_c_With_abC = (a, b, C) => {
                    let c = a * a + b * b - 2 * a * b * Math.cos(C);
                    return Math.sqrt(c);
                },
                compute_area_with_abC = (a, b, C) => {
                    let area = (a * b * Math.sin(C)) / 2;
                    return area;
                };
            let equatorialC = compute_c_With_abC(
                equatorialA,
                equatorialB,
                gama
            );
            let stringC = Math.sqrt(
                h_delta * h_delta + equatorialC * equatorialC
            );
            // console.log("delta", h_delta, equatorialC, stringC);
            let stringGama = Math.acos((2 - stringC * stringC) / 2);
            // console.log("angle:", gama, stringGama);
            // console.log("a,b,c:", equatorialA, equatorialB, equatorialC);
            let mid_equatorial =
                    Math.sqrt(
                        2 * equatorialA * equatorialA +
                            2 * equatorialB * equatorialB -
                            equatorialC * equatorialC
                    ) / 2,
                h_string =
                    (2 * compute_area_with_abC(1, 1, stringGama)) /
                    compute_c_With_abC(1, 1, stringGama);

            // console.log("heightStr,MidLIneEQ", h_string, mid_equatorial);
            let mid = {
                x: midx > 180 ? 180 - midx : midx,
                y: (p1[1] + p2[1]) / 2,
                // y: (Math.acos(mid_equatorial / h_string) / Math.PI) * 180,
                z: height,
            };
            console.log("mid", mid);
            let path = [];
            for (let i = 0; i < 6; i++) {
                // path.push(
                //     interpolation(transform(start), transform(mid), i / 6, true)
                // );
                path.push(transform(interpolation(start, mid, i / 6, true)));
            }
            path.push(transform(mid));
            for (let i = 0; i < 6; i++) {
                // path.push(
                //     interpolation(
                //         transform(mid),
                //         transform(end),
                //         (i + 1) / 6,
                //         false
                //     )
                // );
                path.push(
                    transform(interpolation(mid, end, (i + 1) / 6, false))
                );
            }
            console.log(path);
            return path;
        },
    };
}
export default trailGen;
