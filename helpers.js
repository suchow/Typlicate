// Extend arrays to have .contains() method that tests for the presence of
// a given item.
Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
        return true;
    }
  }
  return false;
}

// Return a new array with no repeated elements.
Array.prototype.unique = function() {
  var arr = [];
  for(var i = 0; i < this.length; i++) {
    if(!arr.contains(this[i])) {
        arr.push(this[i]);
    }
  }
  return arr;
}

// Should the two characters, c1 and c2, be treated as equivalent when typing?
equivalentChars = function(c1, c2) {
  // If there's a perfect match, accept.
  if (c1 === c2) {
    return true;
  }

  // Dictionary of equivalencies. The key is the typed character, the value
  // are the hard-to-type characters that should produce a match.
  var d = { "\"": ["\“", "\”"],
            "\'": ["\’", "\‘"],
            "-" : ["–", "—"],
            "e" : ["é"],
          };

  // If there's a match, accept it.
  if (typeof d[c1] !== "undefined" && d[c1].contains(c2)) {
    return true;
  } else {
    return false;
  }
}
