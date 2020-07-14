function zoomCtrl(v, min = 0.5, max = 1.5) {
  let rate = 0.0003;
  let value = 1.1 * v;
  return {
    onWheel: ({ deltaY }) => {
      value += rate * deltaY;
      value = Math.min(max * v, value);
      value = Math.max(min * v, value);
      console.log(max * v,min * v, rate * deltaY, value);
    },
    value: () => value,
  };
}

export default zoomCtrl;
