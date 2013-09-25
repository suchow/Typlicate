if (Meteor.isClient) {

  // Store session variables in the browser's local storage.
  SessionAmplify = _.extend({}, Session, {
    keys: _.object(_.map(amplify.store(), function (value, key) {
      return [key, JSON.stringify(value)]
    })),
    set: function (key, value) {
      Session.set.apply(this, arguments);
      amplify.store(key, value);
    },
  });

  SessionAmplify.set("book", "Loading...");
  positionInParagraph = 0;
  brCount = 0;
  lockedKeys = [];

  // Treat URL as a request for a certain text.
  Meteor.Router.add({
    '/:id': function (id) {
      SessionAmplify.set('whichBook', id);
      if(typeof SessionAmplify.get(id) === "undefined") {
        SessionAmplify.set(id, 1);
      }
      brCount = 0;
    }
  });

  // When the user selects a new text, route em there.
  $(function () {
    $("#selectText").live("change", function (event) {
      $('#selectText').blur();
      Meteor.Router.to('/' + event.target.value);
      positionInParagraph = 0;
    });
  });

  // Scroll to the element with id #upcoming.
  scrollToUpcoming = function () {
    u = $("#upcoming");
    window.smoothScroll(u.offset().top - 200);
  }

  // Set options for Markdown => HTML conversion.
  marked.setOptions({
    smartypants: true,
  });

  // Reload variables from browser storage.
  if(typeof SessionAmplify.get("whichBook") === "undefined") {
    SessionAmplify.set("whichBook", "gatsby");
  }

  // Store the full text of the book in local storage.
  Template.text.book = function () {
    Meteor.call('getBook', SessionAmplify.get("whichBook"),
      function (error, result) {
        SessionAmplify.set("book", result);
      }
    );
    text = SessionAmplify.get("book");
    return marked(text);
  };

  Template.text.rendered = function () {

    numCompleted = SessionAmplify.get(SessionAmplify.get("whichBook"));

    $('body').on('keyup', function (event) {
      lockedKeys = [];
    });

    // Disabe backspace.
    $('body').on('keydown', function (event) {
      if (event.which === 8) {
        event.stopPropagation();
        event.preventDefault();
      }
    });

    $('body').on('keypress', function (event) {

      if (event.which == 32) {
        event.stopPropagation();
        event.preventDefault();
      }

      thisParagraph = $("#" + numCompleted).text();
      isEndOfParagraph = (positionInParagraph === thisParagraph.length);
      currentSymbol = thisParagraph[positionInParagraph];
      chosenSymbol = String.fromCharCode(event.which)

      $('#selectText').val(SessionAmplify.get("whichBook"))

      if(!lockedKeys.contains(chosenSymbol)) {
        // If the current symbol is a space character, give a free pass.
        if (currentSymbol === " ") {
          positionInParagraph += 1;
          currentSymbol = thisParagraph[positionInParagraph];
        };

        if (currentSymbol === "\n" && !isEndOfParagraph) {
          positionInParagraph += 1;
          currentSymbol = thisParagraph[positionInParagraph];
          brCount += 1;
        };

        // If the current symbol matches the input, proceed.
        // This works, but is shameful.
        if (equivalentChars(chosenSymbol, currentSymbol)) {
          positionInParagraph += 1;
          $("#" + numCompleted + " br").replaceWith("%#%#%#")
          c = $("#" + numCompleted);
          c.html('<span class="complete">' +
                 c.text().substring(0, positionInParagraph + brCount*6) +
                 '</span><span id="upcoming"></span>' +
                 c.text().substring(positionInParagraph + brCount*6, c.text().length))
          $("#" + numCompleted).html($("#" + numCompleted).html().replace(/%#%#%#/g, "<br/>"))
          scrollToUpcoming();
        }

        // If we just finished a paragraph, move on to the next one w/ return.
        if (isEndOfParagraph && event.which == 13) {

          // Move the upcoming span to the start of the next paragraph.
          $('#upcoming').remove();
          numCompleted += 1;
          c = $("#" + numCompleted);
          c.prepend("<span id='upcoming'>")
          scrollToUpcoming();
          positionInParagraph = 0;
          brCount = 0;
        }
      }
      lockedKeys.push(chosenSymbol);
      lockedKeys = lockedKeys.unique();

      // Update amplify storage
      SessionAmplify.set(SessionAmplify.get("whichBook"), numCompleted);
    });

    // Assign each paragraph an id, starting at 0.
    x = $("p");
    for (var i = 0; i < x.length; i++) {
      x[i].id = i;
      if (i >= numCompleted) {
        x[i].className += "incomplete";
      } else if (i === numCompleted+1) {
        x[i].className += "current";
      } else {
        x[i].className += "complete";
      }
    };

    // Automatically scroll to the first unfinished paragraph.
    c = $("#" + numCompleted);
    window.smoothScroll(c.offset().top-195);
  };
}

if (Meteor.isServer) {
  // Returns the text of the requested book.
  Meteor.methods({
    getBook: function (bookName) {
      var path = Npm.require('path');
      p = path.join('books', bookName.concat('.md'));
      return Assets.getText(p);
    }
  });
}
