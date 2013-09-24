Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
        return true;
    }
  }
  return false;
}

// Should the two characters, c1 and c2, be treated as equivalent?
var equivalent = function(c1, c2) {
  // If there's a perfect match, accept.
  if (c1 == c2) {
    return true;
  }

  // If there's a near match, accept.
  var d = { "\"": ["\“", "\”"],
            "\’": ["\'"],
            "—" : ["-"] ,
          };

  if (typeof d[c1] !== "undefined" && d[c1].contains(c2)) {
    return true;
  } else {
    return false;
  }
}

if (Meteor.isClient) {

  Meteor.startup(function () {
    marked.setOptions({
      smartypants: true,
    });
  });

  Session.set("book", "Loading...");
  numCompleted = 3;
  positionInParagraph = 0;

  Meteor.startup(function () {
    Meteor.call('getBook', 'gatsby',
      function (error, result) {
        Session.set("book", result);
      }
    );
  });

  Template.text.book = function () {
    text = Session.get("book");
    return marked(text);
  };

  Template.text.rendered = function () {

    // Put focus on inputter, and never lose it.
    $('#inputter').focus();
    $(function() {
      $('#inputter').bind('focusout', function(e) {
        $(this).focus();
      });
    });

    // Assign each paragraph an id, starting at 0.
    x = $("p");
    for (var i = 0; i <= x.length; i++) {
      x[i].id = i;
      if (i >= numCompleted) {
        x[i].className += "incomplete";
      } else if (i == numCompleted+1) {
        x[i].className += "current";
      } else {
        x[i].className += "complete";
      }
    };
  };

  Template.text.events = {
    "keypress #inputter": function(event) {
      event.preventDefault();
      thisParagraph = $("#" + numCompleted).text();
      currentSymbol = thisParagraph[positionInParagraph];
      chosenSymbol = String.fromCharCode(event.which);

      // If the current symbol is a newline character, give a free pass.
      if (currentSymbol === "\n") {
        positionInParagraph += 1;
        currentSymbol = thisParagraph[positionInParagraph];
      };

      if (equivalent(chosenSymbol, currentSymbol)) {
        positionInParagraph += 1;
      }

      if (positionInParagraph === thisParagraph.length) {
        numCompleted += 1;
        positionInParagraph = 0;
      }
    }
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.methods({
    getBook: function (bookName) {
      var path = Npm.require('path');
      p = path.join('books', bookName.concat('.md'));
      return Assets.getText(p);
    }
  });
}
