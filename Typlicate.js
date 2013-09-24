if (Meteor.isClient) {

  Meteor.startup(function () {
    marked.setOptions({
      smartypants: true,
    });
  });

  Session.get("book", "Loading...");

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
