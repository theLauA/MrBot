/*
  A bot that welcomes new guild members when they join
*/

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();
const ytdl = require('ytdl-core');

// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'MzgxODczMDQ4MDc4Mzg1MTYz.DPNelg.jgswLVJegBkWDPduAj-YRYjD2Vw';

var voice_connection = null;
var dispatcher = null;

var commands = [{
    name: "hi",
    execute: function(message, args){
        message.reply("Sup");
    }
}, {
    name: "join",
    execute: function(message, args){
        join(message);
    }
}, {
    name: "play",
    execute: function(message, args){
        join(message)
        const streamOptions = { seek: 0, volume: 1 };
          
        const stream = ytdl('https://www.youtube.com/watch?v=XAWgeLF9EVQ', { filter : 'audioonly' });
        dispatcher = voice_connection.playStream(stream, streamOptions);
          
          
    }
}, {
    name: 'pause',
    execute: function(message, args){
        dispatcher.pause();
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
            command.execute(message, args);
    }
}

function join(message){
    if (!message.guild) return;
    
            
            // Only try to join the sender's voice channel if they are in one themselves
            if (message.member.voiceChannel) {
                message.member.voiceChannel.join()
                .then(connection => { // Connection is an instance of VoiceConnection
                    voice_connection = connection;
                    message.reply('I have successfully connected to the channel!');
                })
                .catch(console.log);
            } else {
                message.reply('You need to join a voice channel first!');
            }
}