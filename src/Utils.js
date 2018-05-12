const debounce = (func, wait, immediate) => {
  let timeoutId = null;
  return function() {
    let context = this, args = arguments;
    let later = function() {
      timeoutId = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeoutId;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export { debounce };
