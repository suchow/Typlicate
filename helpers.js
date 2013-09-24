// Extend arrays to have a .contains() method that tests for the presence
// of an item in the array.
Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
        return true;
    }
  }
  return false;
}

// Return a new array with the unique elements.
Array.prototype.unique = function() {
  var arr = [];
  for(var i = 0; i < this.length; i++) {
    if(!arr.contains(this[i])) {
        arr.push(this[i]);
    }
  }
  return arr;
}
