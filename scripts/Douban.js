// Generated by CoffeeScript 1.6.3
(function() {
  var Channel, DoubanFM, JsonObject, Player, Song, User, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  JsonObject = (function() {
    function JsonObject(json) {
      var key, value;
      this.json = json;
      for (key in json) {
        value = json[key];
        this[key] = value;
      }
    }

    return JsonObject;

  })();

  Channel = (function(_super) {
    __extends(Channel, _super);

    function Channel() {
      _ref = Channel.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Channel.prototype.isAd = function(song) {
      var sid;
      sid = song.sid;
      return sid.indexOf("_") !== -1;
    };

    Channel.prototype.appendSongs = function(newSongs) {
      var realSongs, song, _i, _len;
      if (newSongs == null) {
        return;
      }
      realSongs = [];
      for (_i = 0, _len = newSongs.length; _i < _len; _i++) {
        song = newSongs[_i];
        if (!this.isAd(song)) {
          realSongs.push(song);
        } else {
          console.log("Filter ad:");
          console.log(song);
        }
      }
      if (this.songs == null) {
        this.songs = [];
      }
      this.songs = this.songs.concat(realSongs);
    };

    Channel.prototype.update = function(succ, err, action, sid, history) {
      var _ref1,
        _this = this;
      return (_ref1 = window.DoubanFM) != null ? _ref1.doGetSongs(this, action, sid, history, (function(json) {
        var s;
        if ((json != null ? json.song : void 0) != null) {
          _this.appendSongs((function() {
            var _i, _len, _ref2, _results;
            _ref2 = json != null ? json.song : void 0;
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              s = _ref2[_i];
              _results.push(new Song(s));
            }
            return _results;
          })());
        }
        return typeof succ === "function" ? succ(_this.songs) : void 0;
      }), err) : void 0;
    };

    return Channel;

  })(JsonObject);

  Song = (function(_super) {
    __extends(Song, _super);

    function Song() {
      _ref1 = Song.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return Song;

  })(JsonObject);

  User = (function(_super) {
    __extends(User, _super);

    function User() {
      _ref2 = User.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    User.prototype.attachAuth = function(data) {
      if (this.user_id != null) {
        data["user_id"] = this.user_id;
      }
      if (this.token != null) {
        data["token"] = this.token;
      }
      if (this.expire != null) {
        return data["expire"] = this.expire;
      }
    };

    return User;

  })(JsonObject);

  Player = (function() {
    function Player() {
      this.sounds = {};
      this.action = {};
      this.action.END = "e";
      this.action.NONE = "n";
      this.action.BOO = "b";
      this.action.LIKE = "r";
      this.action.UNLIKE = "u";
      this.action.SKIP = "s";
      this.maxHistoryCount = 15;
      this.currentSongIndex = -1;
      this.frontMostSongIndex = -1;
      this.looping = false;
      soundManager.setup({
        url: "SoundManager2/swf/",
        preferFlash: false,
        debugMode: false,
        onready: function() {
          var _ref3;
          return (_ref3 = window.T) != null ? _ref3.echo("Player initialized") : void 0;
        },
        ontimeout: function() {
          var _ref3;
          return (_ref3 = window.T) != null ? _ref3.error("Failed to intialize player. Check your brower's flash setting.") : void 0;
        }
      });
    }

    Player.prototype.currentSoundInfo = function() {
      var sound;
      sound = {};
      sound.song = this.currentSong;
      sound.paused = this.currentSound.paused;
      sound.isBuffering = this.currentSound.isBuffering;
      sound.position = this.currentSound.position;
      sound.duration = this.currentSound.duration;
      sound.bytesLoaded = this.currentSound.bytesLoaded;
      sound.bytesTotal = this.currentSound.bytesTotal;
      sound.looping = this.looping;
      return sound;
    };

    Player.prototype.play = function(channel) {
      this.stop();
      return this.startPlay(channel);
    };

    Player.prototype.stop = function() {
      var _ref3, _ref4;
      if ((_ref3 = this.currentSound) != null) {
        _ref3.unload();
      }
      return (_ref4 = this.currentSound) != null ? _ref4.stop() : void 0;
    };

    Player.prototype.pause = function() {
      var _ref3;
      if ((_ref3 = this.currentSound) != null) {
        _ref3.pause();
      }
      return window.T.update_ui(this.currentSoundInfo());
    };

    Player.prototype.resume = function() {
      var _ref3;
      return (_ref3 = this.currentSound) != null ? _ref3.resume() : void 0;
    };

    Player.prototype.loops = function() {
      console.log("Should loop");
      return this.looping = !this.looping;
    };

    Player.prototype.startPlay = function(channel) {
      this.currentChannel = channel;
      this.currentSongIndex = -1;
      this.currentSong = null;
      this.history = [];
      return this.nextSong(this.action.NONE);
    };

    Player.prototype.getHistory = function() {
      var H, str;
      str = "|";
      H = $(this.history).map(function(i, h) {
        return h.join(":");
      });
      str += H.get().join("|");
      return str;
    };

    Player.prototype.updateHistory = function(action) {
      var h, sid;
      if (action === this.action.NONE) {
        return;
      }
      if (this.currentSong) {
        sid = action === this.action.END ? "" : this.currentSong.sid;
        h = [sid, action];
        if (this.history.length > this.maxHistoryCount) {
          this.history = this.history.slice(1);
        }
        this.history.push(h);
        return console.log(this.getHistory());
      }
    };

    Player.prototype.isCacheNeeded = function(callback) {
      var sid, _ref3, _ref4;
      sid = (_ref3 = (_ref4 = this.currentSong) != null ? _ref4.sid : void 0) != null ? _ref3 : "";
      if (this.currentSongIndex + 1 >= this.currentChannel.songs.length) {
        this.currentChannel.update(callback, function() {}, this.action.NONE, sid, this.getHistory());
        return true;
      }
      return false;
    };

    Player.prototype.commitAction = function(action, succ, err) {
      var sid, _ref3;
      if (action === this.action.NONE) {
        return;
      }
      sid = (_ref3 = this.currentSong) != null ? _ref3.sid : void 0;
      if (action === this.action.END || action === this.action.SKIP) {
        if (this.currentSongIndex === this.frontMostSongIndex) {
          this.updateHistory(action);
        }
      } else {
        this.updateHistory(action);
      }
      if (sid == null) {
        return;
      }
      if (this.currentSongIndex > -1) {
        return this.currentChannel.update(succ, err, action, sid, this.getHistory());
      }
    };

    Player.prototype.nextSong = function(action, succ, err) {
      var sid, _ref3, _ref4,
        _this = this;
      this.stop();
      sid = (_ref3 = (_ref4 = this.currentSong) != null ? _ref4.sid : void 0) != null ? _ref3 : "";
      if (this.isCacheNeeded(function(songs) {
        return _this.nextSong(action, succ, err);
      })) {
        return;
      }
      this.commitAction(action, succ, err);
      this.currentSongIndex++;
      this.frontMostSongIndex = Math.max(this.frontMostSongIndex, this.currentSongIndex);
      return this.doPlay(this.currentChannel.songs[this.currentSongIndex]);
    };

    Player.prototype.prevSong = function() {
      if (this.currentSongIndex <= 0) {
        window.T.echo("No previous song...");
        return;
      }
      this.stop();
      this.currentSongIndex--;
      return this.doPlay(this.currentChannel.songs[this.currentSongIndex]);
    };

    Player.prototype.doPlay = function(song) {
      var id, url,
        _this = this;
      id = song.sid;
      url = song.url;
      this.currentSong = song;
      this.currentSound = this.sounds[id];
      window.T.init_ui(song);
      if (this.onPlayCallback != null) {
        this.onPlayCallback(song);
      }
      return this.currentSound != null ? this.currentSound : this.currentSound = soundManager.createSound({
        url: url,
        autoLoad: true,
        whileloading: function() {
          return window.T.update_ui(_this.currentSoundInfo());
        },
        whileplaying: function() {
          return window.T.update_ui(_this.currentSoundInfo());
        },
        onload: function() {
          return this.play();
        },
        onfinish: function() {
          if (_this.looping) {
            return _this.doPlay(_this.currentSong);
          } else {
            return _this.nextSong(_this.action.END);
          }
        },
        onsuspend: function() {
          return console.log("Suspended");
        },
        onconnet: function() {
          var connected;
          connected = _this.currentSound.connected;
          if (!connected) {
            console.log("Connection failed. Try next song");
            return _this.nextSong(_this.action.END);
          }
        }
      });
    };

    return Player;

  })();

  DoubanFM = (function() {
    var app_name, channel_url, domain, login_url, song_url, version;

    app_name = "radio_desktop_win";

    version = 100;

    domain = "http://www.douban.com";

    login_url = "/j/app/login";

    channel_url = "/j/app/radio/channels";

    song_url = "/j/app/radio/people";

    DoubanFM.prototype.attachVersion = function(data) {
      data["app_name"] = app_name;
      return data["version"] = version;
    };

    function DoubanFM(service) {
      var _this = this;
      this.service = service;
      if (window.DoubanFM == null) {
        window.DoubanFM = this;
      }
      this.player = new Player();
      $(document).ready(function() {
        window.T.echo("DoubanFM initialized...");
        return _this.resume_session();
      });
    }

    DoubanFM.prototype.resume_session = function() {
      var cookie_user_json;
      $.cookie.json = true;
      cookie_user_json = $.cookie('user');
      this.user = cookie_user_json != null ? new User(cookie_user_json) : new User();
      return window.TERM.setUser(this.user);
    };

    DoubanFM.prototype.remember = function(always) {
      var expire, expire_day, now, value, _ref3;
      now = new Date();
      expire_day = (this.user.expire - now.getTime() / 1000) / 3600 / 24;
      console.log("Expire in " + expire_day + " days");
      expire = {
        expires: expire_day
      };
      value = (_ref3 = this.user) != null ? _ref3.json : void 0;
      if (always) {
        return $.cookie('user', value, expire);
      } else {
        return $.cookie('user', value);
      }
    };

    DoubanFM.prototype.forget = function() {
      return $.removeCookie('user');
    };

    DoubanFM.prototype.clean_user_data = function() {};

    DoubanFM.prototype.post_login = function(data, remember, succ, err) {
      this.user = new User(data);
      if (this.user.r === 1) {
        if (typeof err === "function") {
          err(this.user);
        }
        return;
      }
      this.remember(remember);
      this.clean_user_data();
      return typeof succ === "function" ? succ(this.user) : void 0;
    };

    DoubanFM.prototype.login = function(email, password, remember, succ, err) {
      var payload,
        _this = this;
      payload = {
        "email": email,
        "password": password
      };
      this.attachVersion(payload);
      this.service.post(domain + login_url, payload, (function(data) {
        return _this.post_login(data, remember, succ, err);
      }), (function(status, error) {
        var data;
        data = {
          r: 1,
          err: "Internal Error: " + error
        };
        return _this.post_login(data, remember, succ, err);
      }));
    };

    DoubanFM.prototype.logout = function() {
      this.user = new User();
      this.forget();
      return this.clean_user_data();
    };

    DoubanFM.prototype.isLoggedIn = function() {
      var _ref3;
      return (this.user != null) && (this.user.user_id != null) && ((_ref3 = this.user) != null ? _ref3.user_id : void 0) !== "";
    };

    DoubanFM.prototype.play = function(channel) {
      var _ref3;
      this.currentChannel = channel;
      return (_ref3 = this.player) != null ? _ref3.play(channel) : void 0;
    };

    DoubanFM.prototype.next = function() {
      var _ref3;
      return (_ref3 = this.player) != null ? _ref3.nextSong(this.player.action.SKIP) : void 0;
    };

    DoubanFM.prototype.onSocialErr = function(status, err) {
      return window.T.error("Operation failed: " + status);
    };

    DoubanFM.prototype.boo = function() {
      var _ref3,
        _this = this;
      if (!this.isLoggedIn()) {
        window.T.error("Need login first");
        return;
      }
      return (_ref3 = this.player) != null ? _ref3.nextSong(this.player.action.BOO, function() {
        return window.T.echo("Done. Will never play again.");
      }, function(status, err) {
        return _this.onSocialErr(status, err);
      }) : void 0;
    };

    DoubanFM.prototype.like = function() {
      var _ref3,
        _this = this;
      if (!this.isLoggedIn()) {
        window.T.error("Need login first");
        return;
      }
      return (_ref3 = this.player) != null ? _ref3.commitAction(this.player.action.LIKE, function() {
        var _ref4, _ref5;
        window.T.echo("Liked");
        return (_ref4 = _this.player) != null ? (_ref5 = _ref4.currentSong) != null ? _ref5.like = 1 : void 0 : void 0;
      }, function(status, err) {
        return _this.onSocialErr(status, err);
      }) : void 0;
    };

    DoubanFM.prototype.unlike = function() {
      var _ref3,
        _this = this;
      if (!this.isLoggedIn()) {
        window.T.error("Need login first");
        return;
      }
      return (_ref3 = this.player) != null ? _ref3.commitAction(this.player.action.UNLIKE, function() {
        var _ref4, _ref5;
        window.T.echo("Unliked");
        return (_ref4 = _this.player) != null ? (_ref5 = _ref4.currentSong) != null ? _ref5.like = 0 : void 0 : void 0;
      }, function(status, err) {
        return _this.onSocialErr(status, err);
      }) : void 0;
    };

    DoubanFM.prototype.prev = function() {
      var _ref3;
      return (_ref3 = this.player) != null ? _ref3.prevSong() : void 0;
    };

    DoubanFM.prototype.pause = function() {
      var _ref3;
      return (_ref3 = this.player) != null ? _ref3.pause() : void 0;
    };

    DoubanFM.prototype.resume = function() {
      var _ref3;
      return (_ref3 = this.player) != null ? _ref3.resume() : void 0;
    };

    DoubanFM.prototype.loops = function() {
      var _ref3;
      return (_ref3 = this.player) != null ? _ref3.loops() : void 0;
    };

    DoubanFM.prototype.stop = function() {
      var _ref3;
      return (_ref3 = this.player) != null ? _ref3.stop() : void 0;
    };

    DoubanFM.prototype.mute = function() {
      var _ref3;
      return (_ref3 = this.player) != null ? _ref3.toggleMute() : void 0;
    };

    DoubanFM.prototype.setVol = function(vol) {
      var range, _ref3, _ref4;
      range = parseInt(vol, 10);
      if (!range || range < 0 || range > 100) {
        if ((_ref3 = window.T) != null) {
          _ref3.error("Volume must be a number between 0~100");
        }
        return;
      }
      return (_ref4 = this.player) != null ? _ref4.setVol(range) : void 0;
    };

    DoubanFM.prototype.update = function(succ, err) {
      var _this = this;
      return this.doGetChannels((function(json) {
        var j;
        _this.channels = (function() {
          var _i, _len, _ref3, _results;
          _ref3 = json != null ? json.channels : void 0;
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            j = _ref3[_i];
            _results.push(new Channel(j));
          }
          return _results;
        })();
        return succ(_this.channels);
      }), err);
    };

    DoubanFM.prototype.doGetChannels = function(succ, err) {
      return this.service.get(domain + channel_url, {}, succ, err);
    };

    DoubanFM.prototype.doGetSongs = function(channel, action, sid, history, succ, err) {
      var payload, _ref3, _ref4;
      payload = {
        "sid": sid,
        "channel": (_ref3 = channel.channel_id) != null ? _ref3 : 0,
        "type": action != null ? action : "n",
        "h": history != null ? history : ""
      };
      this.attachVersion(payload);
      if ((_ref4 = this.user) != null) {
        _ref4.attachAuth(payload);
      }
      return this.service.get(domain + song_url, payload, succ, err);
    };

    return DoubanFM;

  })();

  new DoubanFM(window.Service);

}).call(this);

/*
//@ sourceMappingURL=Douban.map
*/
