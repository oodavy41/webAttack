function rotateCtrl() {
  let press = false;
  let x = (160 * Math.PI) / 180,
    y = (30 * Math.PI) / 180;
  let stop = false;
  let rato = 0.005;
  let last = 0;
  let focusTime = 0;
  let minFocusTime = 3000;
  let focusing = null;
  let end = null;
  function delta(t) {
    let delta = t - last;
    last = t;
    return delta;
  }

  return {
    onPause: () => {
      stop = !stop;
    },
    onMouseDown: () => (press = true),
    onMouseUp: () => (press = false),
    onMove: ({ movementX, movementY }) => {
      if (press) {
        focusing = null;
        x += movementX * rato;
        y += movementY * rato;
        x %= Math.PI * 2;
        y = Math.min(Math.PI / 3, y);
        y = Math.max(-Math.PI / 3, y);
      }
    },
    focus: (curve, onEnd) => {
      focusing = curve;
      end = onEnd;
    },
    update: (t) => {
      let deltaT = delta(t);
      if (!focusing) {
        if (!stop) x += (0.005 * deltaT) / 50;
        x %= Math.PI * 2;
        if (end) {
          end();
          end = null;
        }
      } else {
        focusTime += deltaT;
        let { boat, anime } = focusing;
        console.log(anime, anime.progress);
        if (focusTime > minFocusTime && anime.progress == 100) {
          focusing = null;
          focusTime = 0;
        } else {
          let { x: boat_x, y: boat_y, z: boat_z } = boat.position;
          x = Math.atan(-boat_z / boat_x);
          x = boat_x > 0 ? -x : Math.PI - x;
          x -= Math.PI / 2;
          let r = Math.sqrt(boat_x * boat_x + boat_z * boat_z);
          y = Math.atan(boat_y / r);
          y = Math.min(Math.PI / 3, y);
          y = Math.max(-Math.PI / 3, y);
        }
      }
    },
    get: () => {
      return { x, y };
    },
  };
}
export default rotateCtrl();
