window.Pipe = new window.PipeServerClass(pipe_name)

# make sure this file is included after terminal.js
# then the window.T should be overrided 
class TerminalProxy 
        constructor: (@server_pipe) ->


        onCommand: (command) ->
                @t.exec(command)
                
        bind: (@t) ->
                @server_pipe.registerRPC("do_login", @do_login.bind(@))                
                @server_pipe.registerRPC("command", @onCommand.bind(@))
                @server_pipe.registerRPC("request_user", @request_user.bind(@))
                @server_pipe.registerRPC("request_player_status", @request_player_status.bind(@))
                @server_pipe.registerRPC("request_command_list", @request_command_list.bind(@))                

                window.T = @


        echo: (msg, option) ->
                @server_pipe.fireRPC "echo", [msg, option]
        error: (msg...) ->
                @server_pipe.fireRPC "error", msg...
        set_prompt: (prompt...) ->
                @server_pipe.fireRPC "set_prompt", prompt...
        pause: () ->
                @server_pipe.fireRPC "pause"
        resume: () ->
                @server_pipe.fireRPC "resume"
        clear: () -> 
                @server_pipe.fireRPC "clear"

        init_ui: (song...) ->
                @server_pipe.fireRPC "init_ui", song...

        update_ui: (sound...) ->
                @server_pipe.fireRPC "update_ui", sound...
                
        login_begin: () ->
                @server_pipe.fireRPC "login_begin"
                
        login_succ: (user) ->
                @server_pipe.fireRPC "login_succ", user

        login_fail: (user) ->
                @server_pipe.fireRPC "login_fail", user

        # very nasty, fix later
        do_login: (info) ->
                window.DoubanFM?.login(info.username, info.password, info.remember,
                                        (user) => @login_succ(user),
                                        (user) => @login_fail(user))

        request_user: (origin) ->
                _gaq?.push(['_trackEvent', 'terminal', origin])                
                @server_pipe.fireRPC "set_user", window.TERM.user

        request_player_status: () ->
                if window.DoubanFM?.player?.currentSong?
                        @update_ui window.DoubanFM.player.currentSoundInfo()

        request_command_list: () ->
                @server_pipe.fireRPC "set_command_list", window.Help?.getCommandList()
                                                
window.TerminalProxy ?= new TerminalProxy(window.Pipe)

class Notification
        notify: (msg, title, picture = "radio.png", timeout = 5000) ->
                notif = webkitNotifications.createNotification(
                        picture ? "",
                        title ? ""
                        msg ? "")

                notif.show()
                window.setTimeout(
                        () -> notif.cancel(),
                        timeout)

        notifyList: (msg, list, title, picture = "radio.png", timeout = 15000) ->
                opt = {
                        type: "list",
                        title: title ? "",
                        message: message ? "",
                        iconUrl: picture,
                        items: list ? {}
                        }
                notif = chrome.notifications.create("update_notif", opt, (id) ->
                        window.setTimeout(() -> chrome.notifications.clear("update_notif")
                                ,
                                timeout))

                
        onPlay: (song) ->
                @notify(song.title, "<#{song.albumtitle}> #{song.artist}", song.picture)
                
        constructor: () ->
                window.DoubanFM.player.onPlayCallback = @onPlay.bind(@)

window.Notification = new Notification()

class ConnectionMonitor
        onErrorOccurred: (e) ->
                console.log "Connection failure"
                console.log e
                window.Notification.notify(e.error, "Connection Problem")
                if window?.DoubanFM?.player?.currentSong?
                        window.DoubanFM.next()

        onCompleted: (e) ->
                console.log "Complete"
                console.log e
                
        constructor: () ->
                filter = {urls: ["http://www.douban.com/j/app/*", "http://*.douban.com/*.mp?"]}
                chrome.webRequest.onErrorOccurred.addListener(
                        (e) => @onErrorOccurred(e)
                        ,
                        filter)
                chrome.webRequest.onCompleted.addListener(
                        (e) => @onCompleted(e)
                        ,
                        filter)

window.ConnectionMonitor = new ConnectionMonitor()
        
class Extension
        onInstalled: (info) ->
                # Don't care about chrome update
                if info.reason == "chrome_update"
                        return
                manifest = chrome.runtime.getManifest()
                _gaq?.push(['_trackEvent', info.reason, manifest.version])                        
                @showNewVersion(version)
        showNewVersion: (data) ->
                console.log data
                window.Notification.notifyList(data.message, data.items, data.title)
                        
        constructor: () ->
                @id = chrome.i18n.getMessage("@@extension_id")
                chrome.runtime.onInstalled.addListener @onInstalled.bind(@)

window.Extension = new Extension()
