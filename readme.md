Friend zone lets you search friends like Facebook
===

Friend zone is a jquery plugin that lets you add Facebook-style autocomplete to any webpage.

Why would I use it?
===

1. It's fast.
2. It virtually identically to Facebook's search bar.
3. It's already styled like the Facebook search bar.

What does it look like?
===

![Lastname](http://samfoo.github.com/friendzone.js/images/lastname.png)

![Multiple Names](http://samfoo.github.com/friendzone.js/images/multi-names.png)

![No Results](http://samfoo.github.com/friendzone.js/images/no-results.png)

How do I use it?
===

So you want to socially synergize your web-3.0 ontology with an integrated social graph and HTML5? Your users are logged in using the [Facebook javascript SDK](https://developers.facebook.com/docs/reference/javascript/)?

Awesome sauce. All you gotta do is add an input form to your page:

```html
<input type="text" id="friend-search" />
```

... then add the following somewhere after jquery's been loaded:

```javascript
$(function() {
  FB.api('/me/friends', function(response) {
    new FriendSearch('#friend-search', response.data);
  });
});
```

How do I know when someone gets selected?
===

```javascript
$("#friend-search").on('selected', function(e, friendId) {
  console.log(friendId + " says, 'What's up, dawg?'");
});
```

That's it!
