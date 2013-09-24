// Should the two characters, c1 and c2, be treated as equivalent?
var equivalent = function(c1, c2) {
  // If there's a perfect match, accept.
  if (c1 == c2) {
    return true;
  }

  // If there's a near match, accept.
  var d = { "\"": ["\“", "\”"],
            "\'": ["\’"],
            "-" : ["–"] ,
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
  numCompleted = 1;
  positionInParagraph = 0;
  lockedKeys = [];

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

    $('body').on('keyup', function(event) {
      lockedKeys = [];
    });

    // Disabe backspace.
    $('body').on('keydown', function(event) {
      if (event.which === 8) {
        event.stopPropagation();
        event.preventDefault();
      }
    });

    $('body').on('keypress', function(event) {

      if (event.which == 32) {
        event.stopPropagation();
        event.preventDefault();
      }

      thisParagraph = $("#" + numCompleted).text();
      currentSymbol = thisParagraph[positionInParagraph];
      chosenSymbol = String.fromCharCode(event.which)

      if(!lockedKeys.contains(chosenSymbol)) {
        // If the current symbol is a newline character, give a free pass.
        if (currentSymbol === " ") {
          positionInParagraph += 1;
          currentSymbol = thisParagraph[positionInParagraph];
        };

        // If the current symbol matches the input, proceed.
        if (equivalent(chosenSymbol, currentSymbol)) {
          positionInParagraph += 1;
          c = $("#" + numCompleted);
          c.html('<span class="complete">' +
                 c.text().substring(0, positionInParagraph) +
                 '</span><span id="upcoming"></span>' +
                 c.text().substring(positionInParagraph, c.text().length))
          u = $("#upcoming");
          window.smoothScroll(u.offset().top-200);
        }

        // If we just finished a paragraph, move on to the next one w/ return.
        if (positionInParagraph === thisParagraph.length && event.which == 13) {

          // Move the upcoming span to the start of the next paragraph.
          $('#upcoming').remove();
          numCompleted += 1;
          c = $("#" + numCompleted);
          c.prepend("<span id='upcoming'>")
          u = $("#upcoming");
          window.smoothScroll(u.offset().top-200);
          positionInParagraph = 0;
        }
      }
      lockedKeys.push(chosenSymbol);
      lockedKeys = lockedKeys.unique();
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
