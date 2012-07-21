Friend zone lets you search Facebook friends like... Facebook.
==

One time when I was in college I totally got friend zoned by this really hot girl. I wrote this plugin in her honor.

Checkout some screenshots.

![Lastname](http://samfoo.github.com/friendzone.js/images/lastname.png)
![Multiple Names](http://samfoo.github.com/friendzone.js/images/multi-names.png)
![No Results](http://samfoo.github.com/friendzone.js/images/no-results.png)

How do I use this junk?
===

So you want to socially synergize your web-3.0 ontology? Your users are logged in using the [Facebook javascript SDK](https://developers.facebook.com/docs/reference/javascript/). Awesome sauce. All you gotta do is add an input form to your page:

```html
<input type="text" id="friend-search" />
```

Whoa! You're already 3/4 of the way there! Next add the following somewhere after jquery:

```javascript
$(function() {
  FB.api('/me/friends', function(response) {
    new FriendSearch('#friend-search', response.data);
  });
});
```

Niiiice. Now how do I know when someone gets selected?

```javascript
$("#friend-search").on('selected', function(e, friendId) {
  console.log(friendId + " says, 'What's up, dawg?'");
});
```

That's it!
