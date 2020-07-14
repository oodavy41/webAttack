function zoomCtrl(v, min = 0.5, max = 1.5) {
  let rate = 0.0000000001;
  let value = 1.1 * v;
  return {
    onWheel: ({ deltaY }) => {
      value += rate * deltaY;
      value = Math.max(max * v, value);
      value = Math.min(min * v, value);
    },
    value: () => value,
  };
}

export default zoomCtrl;
