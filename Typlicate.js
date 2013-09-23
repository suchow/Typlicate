if (Meteor.isClient) {

  Session.get("book", "Loading...");

  Meteor.startup(function () {
    Meteor.call('getBook', 'gatsby',
      function (error, result) {
        Session.set("book", result);
      }
    );
  });

  Template.text.book = function () {

    return Session.get("book");
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
