export default class Utils {
  // Calculate the Width in pixels of a Dom element
  static elementWidth(element) {
    return (
      element.clientWidth -
      parseFloat(
        window.getComputedStyle(element, null).getPropertyValue("padding-left"),
      ) -
      parseFloat(
        window
          .getComputedStyle(element, null)
          .getPropertyValue("padding-right"),
      )
    );
  }

  // Calculate the Height in pixels of a Dom element
  static elementHeight(element) {
    return (
      element.clientHeight -
      parseFloat(
        window.getComputedStyle(element, null).getPropertyValue("padding-top"),
      ) -
      parseFloat(
        window
          .getComputedStyle(element, null)
          .getPropertyValue("padding-bottom"),
      )
    );
  }

  static clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  static randRange(a, b) {
    return Math.random() * (b - a) + a;
  }

  static randChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static chance(percent) {
    return Math.random() <= percent;
  }
}
