var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var yt_auth = require('./yt_auth.json');
var yt_api_key = yt_auth.token;
var request = require('request');
var queue = [];
var voice_connection = null;


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '?') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
            break;
            case 'play':
                if (args.length < 2)
                    bot.sendMessage({
                        to:channelID,
                        message: 'Emptyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy'
                    })
                else{
                    search_video(args.slice(1), channelID);
                }
            break;
            case 'join':
                logger.info(bot.channels[channelID].members);
            break;
            // Just add any case commands if you want to..
         }
     }
});


function search_video(query, channelID = null) {
	request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, (error, response, body) => {
		var json = JSON.parse(body);
		if("error" in json) {
            message = "An error has occurred: " + json.error.errors[0].message + " - " + json.error.errors[0].reason;
            // bot.sendMessage({
            //     to:channelID,
            //     message: message
            // })
            logger.info("An error has occurred: " + json.error.errors[0].message + " - " + json.error.errors[0].reason);
		} else if(json.items.length === 0) {
            //message.reply("No videos found matching the search criteria.");
            logger.info("No videos found matching the search criteria.");
		} else {
            add_to_queue(json.items[0].id.videoId, channelID);
            logger.info(json.items[0].id.videoId);
		}
	})
}

function add_to_queue(video,channelID=null, mute = false) {
    
        if(aliases.hasOwnProperty(video.toLowerCase())) {
            video = aliases[video.toLowerCase()];
        }
    
        var video_id = get_video_id(video);
    
        ytdl.getInfo("https://www.youtube.com/watch?v=" + video_id, (error, info) => {
            if(error) {
                //message.reply("The requested video (" + video_id + ") does not exist or cannot be played.");
                //console.log("Error (" + video_id + "): " + error);
                logger.info("Error (" + video_id + "): " + error);
            } else {
                queue.push({title: info["title"], id: video_id, user: message.author.username});
                if (!mute) {
                    //message.reply('"' + info["title"] + '" has been added to the queue.');
                    looger.info('"' + info["title"] + '" has been added to the queue.');
                }
                if(!stopped && !is_bot_playing() && queue.length === 1) {
                    play_next_song();
                }
            }
        });
    }

    function is_bot_playing() {
        return voice_handler !== null;
    }