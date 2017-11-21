/*
  A bot that welcomes new guild members when they join
*/

// Import the discord.js module
const Discord = require('discord.js');
const request = require("request");
// Create an instance of a Discord client
const client = new Discord.Client();
const ytdl = require('ytdl-core');

// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'MzgxODczMDQ4MDc4Mzg1MTYz.DPNelg.jgswLVJegBkWDPduAj-YRYjD2Vw';

var voice_connection = null;
var dispatcher = null;
var playing = false;
var paused = true;
var queue = [];
var np = null;
var np_time = 0;
var yt_api_key = "AIzaSyBFynoBUK0G3LhJegdjyaZKZ1HzCOY7_78";

var commands = [{
    name: "hi",
    execute: function(message, args){
        message.reply("Sup");
    }
}, {
    name: "join",
    execute: function(message, args){
        join(message, ()=>{});
    }
}, {
    name: "play",
    execute: function(message, args){
        
        if (voice_connection === null){
            join(message, ()=>{
                search_video(message, args, "TAIL");
             
            })  
        } 
        else
          search_video(message, args, "TAIL");  

    }
}, {
    name: 'pause',
    execute: function(message, args){
        
        pause(message);
    }
}, {
    name: 'resume',
    execute: function(message, args){
        if(playing === false && paused === true){
            paused = false;
            //playing = true;
            play();
            
        }else{
            message.reply(">>>>>>>>>Invalid Action>>>>>>>>>>");
        }
    }
}, {
    name: 'fuckoff',
    execute: function(message,args){
        playing = false;
        pause = false;
        queue = [];
        np = null;
        np_time = 0;

        voice_connection.disconnect();
        voice_connection = null;

        message.reply("OK.");
    }
}, {
    name: "skip",
    execute: function(message, args){
        skip(message);
    }
}, {
    name: "np",
    execute: function(message, args){
        nowplaying(message);
    }
}];
// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for new guild members
client.on('message', message => {
  // Send the message to a designated channel on a server:
  handle_message(message);
});

// Log our bot in
client.login(token);

function search_command(commandName){
    for(command in commands){
        if(commands[command].name === commandName.toLowerCase()){
            return commands[command];
        }
    }

    return null;
}

function handle_message(message){
    if(message.content[0] === '?'){
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
        var command = search_command(cmd);
        console.log(command);
        if(command)
            command.execute(message, args.slice(1));
    }
}

function join(message, cb){
    if (!message.guild) return;
    
            
    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voiceChannel) {
        message.member.voiceChannel.join()
        .then(connection => { // Connection is an instance of VoiceConnection
            voice_connection = connection;
            message.reply('I have successfully connected to the channel!');
            cb();
        })
        .catch(console.log);
    } else {
        message.reply('You need to join a voice channel first!');
    }
    
}

function play(){
    if(queue.length > 0 && playing === false){

        const streamOptions = { seek: np_time, volume: 1 };
        const stream = ytdl('https://www.youtube.com/watch?v='+queue[0].id, { filter : 'audioonly' });
        console.log(queue[0].id);
        console.log(np_time);
        dispatcher = voice_connection.playStream(stream, streamOptions);
        np_time = 0;
        //console.log(dispatcher.destroyed);
        playing = true;
        np = queue[0];
        
        queue = queue.slice(1);

        //console.log(np.title);
        dispatcher.once('end', function(evt){
            playing = false;
            console.log("end event");
            if(queue.length > 0 && paused !==true){
                np = null;
                np_time = 0;
                play();
            }

        });

        
    } 
}

function pause(message){
    if(playing === true && np !== null){
        paused = true;
        playing = false;
        //np.id = np.id + "?t=" + Math.round(dispatcher.time/1000) + "s";
        np_time = Math.round(dispatcher.time/1000);
        console.log(np_time);
        queue.unshift(np);
        dispatcher.end();
        //voice_connection.disconnect();
        //voice_connection = null;


    } else {
        message.reply(">>>>>>>>>Invalid Action>>>>>>>>>>");
    }
}


function search_video(message, args, position) {
    var query = "";
    
    if(args === null | args.length <= 0){
        message.reply("?play [song_name]");
        return;
    
    }
    for (index in args)
        query += (args[index]+" ");
    
    console.log(query);
	request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, (error, response, body) => {
		var json = JSON.parse(body);
		if("error" in json) {
			message.reply("An error has occurred: " + json.error.errors[0].message + " - " + json.error.errors[0].reason);
		} else if(json.items.length === 0) {
			message.reply("No videos found matching the search criteria.");
		} else {
            add_to_queue(message, json.items[0].id.videoId, position);
		}
	})
}

function add_to_queue(message, video_id, position){
    
    ytdl.getInfo("https://www.youtube.com/watch?v=" + video_id, (error, info) => {
		if(error) {
			message.reply("The requested video (" + video_id + ") does not exist or cannot be played.");
			console.log("Error (" + video_id + "): " + error);
		} else {
            
			var temp = {title: info["title"], id: video_id, user: message.author.username, length_second: info["length_seconds"]};
            
            console.log( info["length_seconds"]);
            switch(position){
                case "HEAD":
                queue.unshift(temp);    
                break;
                case "TAIL":
                queue.push(temp);
                break;
            }
			message.reply('"' + info["title"] + '" has been added to the queue.');
            
            if(playing === false){
				play();
			}
		}
	});

}

function skip(message){
    //console.log(np);
    if(playing === true && np !== null){
        
        message.reply("Skip " + np.title);
        dispatcher.end();
    }
}

function nowplaying(message){
    if(np !== null){
        
        var percent = 0;
        if(np.length_second !== 0 && dispatcher !== null)
            percent = Math.round(dispatcher.time/ 1000 / np.length_second * 10);
        
 
        var progress_bar = "";
        for(var i = 0; i < 9 ; i++){
            if(i === percent)
                progress_bar += "@"
            progress_bar += "__";
        }
        message.channel.send({
            "embed": {
                "title": ">>>>>Now Playing>>>>>",
                "description": np.title + "```\n"+ progress_bar +"```"
            }
        });
    }
}