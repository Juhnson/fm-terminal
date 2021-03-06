// Generated by CoffeeScript 1.6.3
(function() {
  var BooCommand, LikeCommand, UnlikeCommand, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BooCommand = (function(_super) {
    __extends(BooCommand, _super);

    function BooCommand() {
      _ref = BooCommand.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    BooCommand.prototype.execute = function() {
      return window.DoubanFM.boo();
    };

    return BooCommand;

  })(window.CommandBase);

  LikeCommand = (function(_super) {
    __extends(LikeCommand, _super);

    function LikeCommand() {
      _ref1 = LikeCommand.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    LikeCommand.prototype.execute = function() {
      return window.DoubanFM.like();
    };

    return LikeCommand;

  })(window.CommandBase);

  UnlikeCommand = (function(_super) {
    __extends(UnlikeCommand, _super);

    function UnlikeCommand() {
      _ref2 = UnlikeCommand.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    UnlikeCommand.prototype.execute = function() {
      return window.DoubanFM.unlike();
    };

    return UnlikeCommand;

  })(window.CommandBase);

  (new BooCommand("boo", "Boo a song. Skip and never play again (need login)")).register();

  (new LikeCommand("like", "Like a song. Mark with a red heart. (need login)")).register();

  (new UnlikeCommand("unlike", "Unlike a song. Remove red heart (need login)")).register();

}).call(this);

/*
//@ sourceMappingURL=command.social.map
*/
