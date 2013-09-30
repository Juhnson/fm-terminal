// Generated by CoffeeScript 1.6.3
(function() {
  var ChannelCommand, channel, proxy, proxy_domain, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  proxy_domain = "http://localhost:10080";

  proxy = proxy_domain + "/";

  channel = "http://www.douban.com/j/app/radio/channels";

  String.prototype.width = function() {
    var c, i, len, width, _i, _len;
    len = this.length;
    width = 0;
    for (c = _i = 0, _len = this.length; _i < _len; c = ++_i) {
      i = this[c];
      if (this.charCodeAt(i) || this.charCodeAt(i) > 126) {
        width += 2;
      } else {
        width++;
      }
    }
    return width;
  };

  ChannelCommand = (function(_super) {
    __extends(ChannelCommand, _super);

    function ChannelCommand() {
      _ref = ChannelCommand.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ChannelCommand.prototype.on_data = function(data) {
      var channels, delta, i, line, max_name_length, name, name_per_line, names, space, str, _i, _j, _len, _len1;
      window.T.resume();
      channels = data.channels;
      if (channels == null) {
        this.echo("Error " + parsed.error);
        return;
      }
      max_name_length = 0;
      this.echo(Array(80).join('-'));
      names = [];
      for (_i = 0, _len = channels.length; _i < _len; _i++) {
        channel = channels[_i];
        name = "" + channel.seq_id + "." + channel.name;
        names.push(name);
        max_name_length = Math.max(name.width(), max_name_length);
      }
      name_per_line = Math.floor(80 / max_name_length);
      line = "";
      space = 2;
      for (i = _j = 0, _len1 = names.length; _j < _len1; i = ++_j) {
        name = names[i];
        if (i !== 0 && i % name_per_line === 0) {
          this.echo(line);
          line = "";
        }
        str = "[[ub;#2ecc71;#000]" + name + "]";
        delta = max_name_length - name.width();
        line += str + Array(Math.ceil(delta / 4) + 1).join("\t");
      }
      this.echo(line);
      this.echo(Array(80).join('-'));
    };

    ChannelCommand.prototype.on_error = function(status, error) {
      window.T.resume();
      this.echo("Status: " + status);
      this.echo("Error: " + error);
      this.echo("Error, try again later");
    };

    ChannelCommand.prototype.execute = function() {
      var _this = this;
      this.echo("Requesting...");
      window.T.pause();
      $.ajax({
        type: 'GET',
        dateType: 'jsonp',
        data: {
          'url': channel
        },
        url: proxy,
        xhrFields: {
          withCredentials: false
        },
        success: function(data) {
          return _this.on_data(data);
        },
        error: function(j, status, error) {
          return _this.on_error(status, error);
        }
      });
    };

    return ChannelCommand;

  })(window.CommandBase);

  (new ChannelCommand("channel", "Show channel list")).register();

}).call(this);

/*
//@ sourceMappingURL=command.channel.map
*/
