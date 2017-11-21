const DiscordCommand = require('../DiscordCommand.js');
const StringUtils = require('../../Utils/String.js');
var Discord = require('discord.js');

class DiscordCommandInfo extends DiscordCommand {

	constructor(subsystem) {
		super("info", "Pings the server and names the admins", 'info', subsystem);
	}

	onRun(message, permissions, args) {
		var config = this.subsystem.manager.getSubsystem("Config").config;
		var byondSS = this.subsystem.manager.getSubsystem("Byond Connector");
		var discord = this.subsystem.manager.getSubsystem("Discord").discord;

		byondSS.byondConnector.request("?adminwho", (resultsadmin) => {
			if ('error' in resultsadmin) {
				return message.reply(resultsadmin.error);
			}

			var adminwho = resultsadmin.data;
			adminwho = adminwho.split(":")[1];
			adminwho = StringUtils.replaceAll(adminwho, "\t", "");
			adminwho = StringUtils.replaceAll(adminwho, "\0", "");
			byondSS.byondConnector.request("?ping", (results) => {
				if ('error' in results) {
					return message.reply(results.error);
				}
				byondSS.byondConnector.request("?status", (resultsstatus) => {
					if ('error' in resultsstatus) {
						return message.reply(results.error);
					}
					var statusarray = resultsstatus.data.split("&");
					var statusarray2 = [];
					for(var i = 0; i < 18; i++) {
						var keyandvalue = statusarray[i];
						var valuearray = keyandvalue.split("=");
						if(valuearray[0] == "real_mode") {
							continue
						}
						var value = valuearray[1];
						statusarray2.push(value);
						//for a list of all the values, either uncomment the line below this or check world.dm in the game repo
						//console.log(valuearray)
					}
					var round_duration = statusarray2[15];
					round_duration = Math.round(round_duration/60);
					var embedcolor = "";
					var colors = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

					for(var count = 0; count < 6; count++) {
						embedcolor = embedcolor + colors[Math.floor(Math.random() * colors.length)];
						//picks a colour from the array "colours" then proceeds to add it to "colour", and stops once "colour" has 6 digits
					}
					if(adminwho == "\n") {
						adminwho = "No admins online";
					}

					var embed = new Discord.RichEmbed();

					embed.setAuthor("Information", "http://i.imgur.com/GPZgtbe.png");
					embed.setDescription("Join the server now by using " + config.server_join_address);
					embed.addField("Players online:", results.data, true);
					embed.addField("Current round:", byondSS.roundNumber, true);
					embed.addField("Round duration:", round_duration + " Minutes", true);
					embed.addField("Admins online:", adminwho, false);
					embed.setColor(embedcolor);

					var channel = config.discord_public_channel;
					message.channel.send({embed});
				});
			});
		});
	}

}

module.exports = DiscordCommandInfo;
