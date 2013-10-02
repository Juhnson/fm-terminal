// Generated by CoffeeScript 1.6.3
(function() {
  var Channel, DoubanFM, JsonObject, Player, Service, Song, User, _ref, _ref1, _ref2,
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

    Channel.prototype.appendSongs = function(newSongs) {
      if (newSongs == null) {
        return;
      }
      if (this.songs == null) {
        this.songs = [];
      }
      this.songs = this.songs.concat(newSongs);
    };

    Channel.prototype.update = function(succ, err, action, sid, history) {
      var _ref1,
        _this = this;
      return (_ref1 = window.DoubanFM) != null ? _ref1.doGetSongs(this, action, sid, history, (function(json) {
        var s;
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

    Song.prototype.like = function() {
      var _ref2;
      return (_ref2 = window.DoubanFM) != null ? _ref2.doLike(this) : void 0;
    };

    Song.prototype.unlike = function() {
      var _ref2;
      return (_ref2 = window.DoubanFM) != null ? _ref2.doUnlike(this) : void 0;
    };

    Song.prototype.boo = function() {
      var _ref2;
      return (_ref2 = window.DoubanFM) != null ? _ref2.doBoo(this) : void 0;
    };

    Song.prototype.skip = function() {
      var _ref2;
      return (_ref2 = window.DoubanFM) != null ? _ref2.doSkip(this) : void 0;
    };

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

  Service = (function() {
    function Service(proxy) {
      this.proxy = proxy;
    }

    Service.prototype.encodePayload = function(payload) {
      var k, pairs, str, v;
      pairs = [];
      for (k in payload) {
        v = payload[k];
        pairs.push(k + "=" + v);
      }
      str = pairs.join("&");
      return $.base64.encode(str);
    };

    Service.prototype.query = function(type, url, payload, succ, err) {
      var encoded, encoded_payload;
      encoded = this.encodePayload(payload);
      encoded_payload = {
        'url': $.base64.encode(url),
        'payload': encoded
      };
      console.log("" + type + " " + url);
      console.log("Payload: ");
      console.log(payload);
      console.log("Encoded: ");
      console.log(encoded_payload);
      console.log("Decoded: ");
      console.log($.base64.decode(encoded));
      return $.jsonp({
        type: type,
        data: encoded_payload,
        url: this.proxy + "?callback=?",
        xhrFields: {
          withCredentials: false
        },
        success: function(data) {
          return succ(data);
        },
        error: function(j, status, error) {
          return err(status, error);
        }
      });
    };

    Service.prototype.get = function(url, data, succ, err) {
      return this.query("GET", url, data, succ, err);
    };

    Service.prototype.post = function(url, data, succ, err) {
      return this.query("POST", url, data, succ, err);
    };

    return Service;

  })();

  if (window.Service == null) {
    window.Service = new Service(proxy_domain);
  }

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
      this.looping = false;
      soundManager.setup({
        url: "SoundManager2/swf/",
        preferFlash: false,
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

    Player.prototype.bind = function(div) {
      return this.$ui = $(div);
    };

    Player.prototype.onLoading = function() {};

    Player.prototype.formatTime = function(ms) {
      var MM, MS, SS, s, zeroPad;
      zeroPad = function(num, places) {
        var zero;
        zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
      };
      s = Math.floor(ms / 1000);
      MS = ms - s * 1000;
      MM = Math.floor(s / 60);
      SS = s - MM * 60;
      return "" + (zeroPad(MM, 2)) + ":" + (zeroPad(SS, 2));
    };

    Player.prototype.onPlaying = function(pos) {
      var bar, barArray, barCount, bar_middle, bar_str, border_left, border_right, buffering, duration, empty_bar, hl_format, i, left, load_slider, load_slider_pos, loaded_bar, loaded_percent, nm_format, no_format, play_percent, play_slider, play_slider_pos, played_bar, playing, right, time_played, time_total, _i, _j, _k, _ref3, _ref4, _ref5;
      barCount = 30;
      playing = !this.currentSound.paused;
      buffering = this.currentSound.isBuffering;
      pos = this.currentSound.position;
      duration = this.currentSound.duration;
      play_percent = pos / duration;
      loaded_percent = this.currentSound.bytesLoaded / this.currentSound.bytesTotal;
      load_slider_pos = Math.floor(barCount * loaded_percent);
      play_slider_pos = Math.floor(barCount * play_percent);
      hl_format = "[gb;#2ecc71;#000]";
      nm_format = "[gb;#fff;#000]";
      no_format = "[gb;#000;#000]";
      left = $.terminal.escape_brackets(this.looping ? ">" : "[");
      right = $.terminal.escape_brackets(this.looping ? "<" : "]");
      border_left = "[" + nm_format + left + "]";
      border_right = "[" + nm_format + right + "]";
      empty_bar = "[" + no_format + "=]";
      load_slider = "[" + nm_format + "☁]";
      loaded_bar = "[" + nm_format + "=]";
      play_slider = "[" + hl_format + (playing ? "♫" : "♨") + "]";
      played_bar = "[" + hl_format + (playing ? ">" : "|") + "]";
      barArray = Array(barCount);
      for (i = _i = 0, _ref3 = barCount - 1; 0 <= _ref3 ? _i <= _ref3 : _i >= _ref3; i = 0 <= _ref3 ? ++_i : --_i) {
        barArray[i] = empty_bar;
      }
      for (i = _j = play_slider_pos, _ref4 = load_slider_pos - 1; play_slider_pos <= _ref4 ? _j <= _ref4 : _j >= _ref4; i = play_slider_pos <= _ref4 ? ++_j : --_j) {
        barArray[i] = loaded_bar;
      }
      for (i = _k = 0, _ref5 = play_slider_pos - 1; 0 <= _ref5 ? _k <= _ref5 : _k >= _ref5; i = 0 <= _ref5 ? ++_k : --_k) {
        barArray[i] = played_bar;
      }
      barArray[load_slider_pos] = load_slider;
      barArray[play_slider_pos] = play_slider;
      bar_middle = barArray.join("");
      time_played = "[" + nm_format + (this.formatTime(pos)) + "]";
      time_total = "[" + nm_format + (this.formatTime(duration)) + "]";
      bar_str = "" + time_played + border_left + bar_middle + border_right + time_total;
      bar = $.terminal.format(bar_str);
      this.$ui.text("");
      return this.$ui.append(bar);
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
      return this.onPlaying(this.currentSound.position);
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

    Player.prototype.nextSong = function(action) {
      var h, sid,
        _this = this;
      this.stop();
      sid = "";
      if (this.currentSong) {
        sid = this.currentSong.sid;
        h = [sid, action];
        if (this.history.length > this.maxHistoryCount) {
          this.history = this.history.slice(1);
        }
        this.history.push(h);
        console.log(this.getHistory());
      }
      if (this.currentSongIndex + 1 >= this.currentChannel.songs.length) {
        this.currentChannel.update(function(songs) {
          return _this.nextSong(action);
        }, function() {}, action, sid, this.getHistory());
        return;
      }
      if (this.currentSongIndex > -1) {
        this.currentChannel.update(null, null, action, sid, this.getHistory());
      }
      this.currentSongIndex++;
      return this.doPlay(this.currentChannel.songs[this.currentSongIndex]);
    };

    Player.prototype.doPlay = function(song) {
      var album, artist, id, like, like_format, picture, title, url,
        _this = this;
      id = song.sid;
      url = song.url;
      artist = song.artist;
      title = song.title;
      album = song.albumtitle;
      picture = song.picture;
      like = song.like !== 0;
      like_format = like ? "[gb;#f00;#000]" : "[gb;#fff;#000]";
      window.T.echo("[" + like_format + "♥ ][[gb;#e67e22;#000]" + song.artist + " - " + song.title + " | " + song.albumtitle + "]");
      this.currentSong = song;
      this.currentSound = this.sounds[id];
      window.T.echo("Loading...", {
        finalize: function(div) {
          return _this.bind(div);
        }
      });
      return this.currentSound != null ? this.currentSound : this.currentSound = soundManager.createSound({
        url: url,
        autoLoad: true,
        whileloading: function() {
          return _this.onLoading();
        },
        whileplaying: function() {
          return _this.onPlaying();
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

    DoubanFM.prototype.play = function(channel) {
      var _ref3;
      this.currentChannel = channel;
      return (_ref3 = this.player) != null ? _ref3.play(channel) : void 0;
    };

    DoubanFM.prototype.next = function() {
      var _ref3;
      return (_ref3 = this.player) != null ? _ref3.nextSong(this.player.action.SKIP) : void 0;
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

    DoubanFM.prototype.doLike = function(song) {};

    DoubanFM.prototype.doUnlike = function(song) {};

    DoubanFM.prototype.doBoo = function(song) {};

    DoubanFM.prototype.doSkip = function(song) {};

    return DoubanFM;

  })();

  new DoubanFM(window.Service);

}).call(this);

/*
//@ sourceMappingURL=Douban.map
*/
