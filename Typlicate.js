if (Meteor.isClient) {

  Meteor.startup(function () {
    marked.setOptions({
      smartypants: true,
    });
  });

  Session.set("book", "Loading...");

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
    };
  };

  Template.text.events = {
    "keypress #inputter": function(event) {
      console.log(String.fromCharCode(event.which));
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
