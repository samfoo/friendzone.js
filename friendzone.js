var FriendSearch = (function() {
  function FriendSearch(input, friends) {
    var self = this;

    this.input = input;
    this.graph = new Graph();

    for (var i=0; i < friends.length; i++) {
      this.graph.insert(friends[i].name, friends[i].id);
    }

    $(function() {
      var select = function(item) {
        if (item.length > 0) {
          $(self.input).trigger('selected', item.data('facebook-id'));
          self.dismissHints();
        }
      };

      $(self.input).on('input', function(e) { self.search($(self.input).val()); });
      $(self.input).on('keydown', function(e) {
        if (e.which == 40) { // Down arrow
          self.moveSelection('down');
        }
        else if (e.which == 38) { // Up arrow
          self.moveSelection('up');
        }
        else if (e.which == 13) { // Enter/return
          var active = $('.fac-container .fac-item.active');
          select(active);
        }
        else if (e.which == 27) {
          self.dismissHints();
        }
      });

      self.appendStyle();
      $('body').append('<div class="fac-container"></div>');
      $('.fac-container .fac-item').live('mouseenter', function() {
        var current = $('.fac-container .fac-item.active');
        current.removeClass('active');
        $(this).addClass('active');
      });

      $('.fac-container .fac-item').live('click', function() {
        select($(this));
      });

      $(self.input).focusout(function() {
        self.dismissHints();
      });

      $(self.input).focusin(function() {
        self.search($(self.input).val());
      });
    });
  };


  FriendSearch.prototype.search = function(prefix) {
    prefix = this.graph.normalize(prefix);

    if (prefix == "") {
      this.dismissHints();
    }
    else {
      var results = {};
      var tokens = prefix.split(/\s/);

      for (var i=0; i < tokens.length; i++) {
        var friends = this.graph.prefixedBy(tokens[i]);

        if (i == 0) {
          results = friends;
        }
        else {
          for (var key in results) {
            if (!friends.hasOwnProperty(key)) {
              delete results[key];
            }
          }
        }
      }

      this.displayHints(results);
    }
  };

  FriendSearch.prototype.dismissHints = function() {
    $('.fac-container').css('display', 'none');
  }

  FriendSearch.prototype.moveSelection = function(direction) {
    var current = $('.fac-container .fac-item.active');
    if (current.length == 0) {
      if (direction == 'up') {
        $('.fac-container .fac-item:last').addClass('active');
      }
      else {
        $('.fac-container .fac-item:first').addClass('active');
      }
    }
    else {
      current.removeClass('active');

      if (direction == 'up') {
        current.prev().addClass('active');
      }
      else {
        current.next().addClass('active');
      }
    }
  };

  FriendSearch.prototype.appendStyle = function() {
    var styles = [
      ".fac-container { background-color: white; border: 1px solid #000; overflow: hidden; display: none; }",
      ".fac-item { cursor: pointer; min-height: 50px; padding: 2px 30px 2px 63px;  border-top: 1px solid white; border-bottom: 1px solid white; }",
      ".fac-item img { position: absolute; left: 6px; height: 50px; width: 50px; }",
      ".fac-name, .fac-footer { color: #3b5998; font-weight: bold; font-family: 'lucida grande',tahoma,verdana,arial,sans-serif; font-size: 11px; line-height: 18px; }",
      ".fac-item.active { background-color: #6d84b4; border-color: #3b5998; }",
      ".fac-item.active .fac-name { color: #fff; }",
      ".fac-footer { background-color: #f7f7f7; border: 1px solid #ddd; text-align: center; min-height: 20px; padding: 10px; }"
    ];
    $('head').append('<style type="text/css">' + styles.join("\n") + '</style>');
  };

  FriendSearch.prototype.clear = function() {
    $('.fac-container').empty();
    $('.fac-container').
      css('display', 'block').
      css('position', 'absolute').
      css('left', $(this.input).position().left).
      css('top', $(this.input).position().top + $(this.input).outerHeight()).
      css('width', $(this.input).outerWidth());
  };

  FriendSearch.prototype.displayHints = function(friends) {
    this.clear();

    var i = 0;
    for (var id in friends) {
      if (i > 4) {
        break;
      }

      var friendId = id;
      var friendName = friends[id];

      var friendDiv = $('<div class="fac-item" data-facebook-id="' + friendId + '"></div>');
      var friendImg = $('<img src="//graph.facebook.com/' + friendId + '/picture" />');
      var friendName = $('<div class="fac-name">' + friendName + '</div>');

      friendDiv.append(friendImg);
      friendDiv.append(friendName);

      $('.fac-container').append(friendDiv);

      i++;
    }

    if (i > 0) {
      var footer = $('<div class="fac-footer"> Showing results for ' + $(this.input).val() + '</div>');
      $('.fac-container').append(footer);
    }
    else {
      var footer = $('<div class="fac-footer">No friends for ' + $(this.input).val() + ' :-(</div>');
      $('.fac-container').append(footer);
    }
  };

  return FriendSearch;
})();

var Graph = (function() {
  function Graph() {
    this.root = 0;
    this.graph = {0: []};
    this.ids = [0]
    this.accepts = {};
  };

  Graph.prototype.insert = function(name, id) {
    var self = this;
    var orig = name

    var rinsert = function(node, fragment) {
      if (fragment.length == 0) {
        if (typeof self.accepts[node] == 'undefined') {
          self.accepts[node] = {}
        }

        self.accepts[node][id] = orig;
      }
      else {
        var letters = [];
        var nodes = [];

        for (var i=0; i < self.graph[node].length; i++) {
          var pair = self.graph[node][i];
          letters.push(pair.letter);
          nodes.push(pair.node);
        }

        var node_index = letters.indexOf(fragment[0]);
        if (node_index > -1) {
          // This edge already exists in the graph, move along...
          rinsert(nodes[node_index], fragment.slice(1));
        }
        else {
          // The edge doesn't already exist, so make it...
          var next_node_id = self.ids.length;
          self.graph[node].push({letter: fragment[0], node: next_node_id});
          self.graph[next_node_id] = [];
          self.ids.push(next_node_id);

          rinsert(next_node_id, fragment.slice(1));
        }
      }
    };

    var names = name.split(/\s+/);

    for (var i=0; i < names.length; i++) {
      rinsert(this.root, this.normalize(names[i]));
    }
  };

  Graph.prototype.normalize = function(name) {
    return name.toLowerCase().trim();
  };

  Graph.prototype.words = function() {
    var words = [];

    for (var key in this.accepts) {
      if (this.accepts.hasOwnProperty(key)) {
        words.push(this.accepts[key]);
      }
    }

    return words;
  };

  Graph.prototype.prefixedBy = function(prefix) {
    return this.wordsFrom(this.nodeFor(this.normalize(prefix)));
  };

  Graph.prototype.wordsFrom = function(node) {
    var self = this;

    var rwords = function(node, results) {
      if (typeof self.accepts[node] != 'undefined') {
        for (var key in self.accepts[node]) {
          results[key] = self.accepts[node][key];
        }
      }

      for (var i=0; i < self.graph[node].length; i++) {
        var next = self.graph[node][i].node;
        rwords(next, results);
      }

      return results;
    };

    if (node !== null) {
      return rwords(node, {});
    }
    else {
      return {};
    }
  }

  Graph.prototype.nodeFor = function(word) {
    var self = this;

    var rnode = function(node, fragment) {
      if (fragment.length == 0) {
        return node;
      }
      else {
        for (var i=0; i < self.graph[node].length; i++) {
          var n = self.graph[node][i];
          if (n.letter == fragment[0]) {
            return rnode(n.node, fragment.slice(1));
          }
        }

        return null;
      }
    };

    return rnode(this.root, this.normalize(word));
  };

  return Graph;
})();

