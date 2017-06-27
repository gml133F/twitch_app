var channels = {
	followed: ["freecodecamp", "ESL_SC2", "OgamingSC2", "syndicate", "storbeck", "brunofin", "summit1g", "esl_csgo", "lirik", "sodapoppin", "drdisrespectlive"],

	createCookie: function() {

		var followed = JSON.stringify(this.followed);
		var date = new Date;
		date = Date.parse(date);
		date = date+(86400000*90);
		expDate = (new Date(date)).toUTCString();

		document.cookie = "followed="+ followed + ";expires=" + expDate;
		
	},

	getCookie: function(){

		var arr = document.cookie.split("=");
		
		if (arr.indexOf("followed") != -1) {
			var followedIndex = arr.indexOf("followed")+1;
			var followed = arr[followedIndex].split(";")
			channels.followed = JSON.parse(followed[0]);
		}

		else {
			channels.followed = channels.default;
		}
	},

	//default channels
	default: ["freecodecamp", "ESL_SC2", "OgamingSC2", "syndicate", "storbeck", "brunofin", "summit1g", "esl_csgo", "lirik", "sodapoppin", "drdisrespectlive"],

	//Stores objects containing propreties retrieved from twitch API
	channelData: [],

	//Checks if all ajax requests are completed before displaying results
	ajaxCounter: 0,

	//Update channel objects with API data
	updateChannelData : function() {
		this.channelData = [];

		this.followed.forEach(function(channel, position) {

			this.channelData.push(new this.Channel(channel));

			this.getStatus(channel, position);

		}, this);


	},

	//Constructor for channels
	Channel: function(channel) {
		this.user = channel;
		this.url = "https://www.twitch.tv/" + channel;
	},

	//"Streams" API call
	getStatus: function(channel, position) {

		var url = "https://wind-bow.glitch.me/twitch-api/streams/" + channel;
		$.ajax({
			dataType: "json",
			url: url,
			data: "json",
			success: function(data) {
				if (data.stream) {
					channels.channelData[position].status = "online";
					channels.channelData[position].game = data.stream.game;
					channels.channelData[position].viewers = data.stream.viewers;
				} else {
					channels.channelData[position].status = "offline";
				}

			},

			complete: function() {
				channels.ajaxCounter++;
				if (channels.ajaxCounter === channels.followed.length * 2) {
					channels.display(channels.channelData);
					channels.ajaxCounter = 0;
				}
			}

		});

		var url2 = "https://wind-bow.glitch.me/twitch-api/users/" + channel;
		$.ajax({
			dataType: "json",
			url: url2,
			data: "json",
			success: function(data) {
				channels.channelData[position].name = data.display_name;
				channels.channelData[position].logo = data.logo;
				channels.channelData[position].id = data._id;
			},

			complete: function() {
				channels.ajaxCounter++;
				if (channels.ajaxCounter === channels.followed.length * 2) {
					channels.display(channels.channelData);
					channels.ajaxCounter = 0;
				}
			}
		});
	},

	//Display results on the DOM
	display: function(channel){

		$("#channels_online").html(""); //resets followed channels div
		$("#channels_offline").html("");
		$("#channels_closed").html("");

		this.channelData.forEach(function(channel){
			
			var logo = this.checkProp(channel, "logo");

			if (channel.status === "online") {
				$("#channels_online").append('<div class="online followed" id="' + channel.user + '"><div class="logoDiv"><img src="'+ logo + 
					'" alt="channel logo" class="channel_logo"></div><div class="info"><div class="infoName"><span class="channel_name">'+ channel.name + 
					'</span></div><div class="infoStatus"><span class="channel_status">' + 
					channel.status + '</span>' + '<span class="channel_viewers"><i class="fa fa-user-circle-o" aria-hidden="true"></i> ' + channel.viewers +
					' viewers</span><br />' + '<span class="channel_game"><i class="fa fa-gamepad" aria-hidden="true"></i> Now playing : ' + channel.game +
					'</span>' + "</div></div><div class='delete'><i class='fa fa-trash' aria-hidden='true'></i></div></div></div>");
			}

			else if (channel.status === "offline" && channel.id != undefined) {
				$("#channels_offline").append('<div class="offline followed" id="' + channel.user +'"><div class="logoDiv"><img src="'+ logo +
					'" alt="channel logo" class="channel_logo"></div><div class="info"><div class="infoName"><span class="channel_name">'+ channel.name + 
					'</span></div><div class="infoStatus"><span class="channel_status">' +
					channel.status + '</span>' +"</div></div><div class='delete'><i class='fa fa-trash' aria-hidden='true'></i></div></div>");
			}

			else if (channel.status === "offline"  && channel.id === undefined) {
				$("#channels_closed").append('<div class="closed followed" id="' + channel.user + '"><div class="logoDiv"><img src="'+ logo +
					'" alt="channel logo" class="channel_logo"></div><div class="info"><div class="infoName"><span class="channel_name">'+ channel.user + 
					'</span></div><div class="infoStatus"><span class="channel_closed">This channel is not available anymore</span>' +
					"</div></div><div class='delete'><i class='fa fa-trash' aria-hidden='true'></i></div></div>");
				$(".closed").css("background-color", "rgba(0,0,0,0.3)");
			}

		}, this);


		eventsSetup.links();
		eventsSetup.clickDelete();
		eventsSetup.footerHeight();
		eventsSetup.tabsDisplay(eventsSetup.tabState)
	},

	//Check if an object has a prop, takes an object and a string as args
	checkProp: function(object, value) {

		if (object[value]) {
			return object[value];
		}
		else if (value === "logo"){
			return "https://png.icons8.com/color/1600/twitch";
		}

		else if (value === "bio") {
			return "";
		}

	},

	//Delete a followed channel by name
	delete: function(target) {
		this.followed.forEach(function(value, position) {
			if(value === target) {
				this.followed.splice(position, 1);
			}
		}, this);

		$("#" + [target]).remove();
		this.createCookie();
		
	}

};

var eventsSetup = {

	//Revert followed channels to default
	default: function() {
		$("#default").click(function(e) {
			e.preventDefault();
			channels.followed = channels.default;
			channels.updateChannelData();
			channels.createCookie();
		});
	},

	//Shows shows the modal and sets up the event listeners to close it
	showModal: function() {
		$("#showModal").click(function() {
			$(".modal_bg").fadeIn(200, function() {
				$("#modal_bg").css("display", "block");
				eventsSetup.hideModal();
				eventsSetup.formSubmit();
				$("#search_channel").focus();
			});
		});
	},

	//close modal and resets the modal form
	hideModal: function() {
		$(window).click(function(event) {
			if (event.target.className === "modal_bg" || event.target.className === "hide_modal")
				$(".modal_bg").fadeOut(200, function() {
					$("#modal_bg").css("display", "none");
					eventsSetup.resetSearch();
				});
		});
	},


	//ajax request to twitch API with searched name
	formSubmit: function() {

		$("#reset_search").click(function() {
			eventsSetup.resetSearch();
		});

		$("#search_form").submit(function(e) {
			e.preventDefault();
			var searchTerm = $("#search_channel").val();

			var url = "https://wind-bow.glitch.me/twitch-api/users/" + searchTerm;
			$.ajax({
				dataType: "json",
				url: url,
				data: "json",
				success: function(data) {

					var info = {};

					info.name = data.display_name;
					info.logo = data.logo;
					info.id = data._id;
					info.bio = data.bio;
					info.created = data.created_at;

					eventsSetup.showSearch(info);
				}

			});

		});

	},

	//Displays search results in modal
	showSearch: function (info) {

		$("#search_result").html("");

		if (info.id) {

			var logo = channels.checkProp(info, "logo");

			var bio = channels.checkProp(info, "bio");

			$("#search_result").html('<div class="result" id="'+ info.name +'"><div class="result_flex"><div class ="result_logo"><img src="'+ logo + '" alt="channel logo" class="channel_logo"></div><div class="result_info"><div class="channel_name">' + info.name + 
				'</div><br /><div class="channel_bio">' + bio + '</div></div></div></div>' + '<button id="add_channel" class="result"><i class="fa fa-plus" aria-hidden="true"></i>Add</button>');
			$(".result").fadeIn(200);
			console.log($(".result").html());
			
			eventsSetup.links();
			eventsSetup.add(info.name);
		}

		else {
			var name = $("#search_channel").val();
			$("#search_result").html('<div class="result" id="'+ name +'"><img src="https://png.icons8.com/color/1600/twitch" alt="channel logo" class="channel_logo">'+ '<span class="channel_name"> No channel named '
				+ name  + ' found on Twitch.tv</span>');
			$(".result").fadeIn(200);
		}

	},

	//Resets the modal 
	resetSearch: function() {
		$("#search_result").html("");
		$("#search_channel").val("");
		$("#search_channel").focus();
	},

	//Add a channel to followed channels and display footer notification
	add: function(name) {

		

		$("#add_channel").click(function(e) {
			
			e.preventDefault();
			if (eventsSetup.alreadyFollowed(name) === false) {
				channels.followed.push(name);
				channels.updateChannelData();
				channels.createCookie();

				$(".modal_bg").fadeOut(200, function() {
					$("#modal_bg").css("display", "none");

					eventsSetup.resetSearch();

					var added = "successfully added the following channel : " + name; 
					$(".channel_notification").html(added).css("background", "rgba(60,210,67,0.8)");
					$(".channel_notification").fadeIn(300).delay(3000).fadeOut(300, function() {
						$(".channel_notification").html("&copy;GML 2017 | Twitch.tv App |<a href='https://www.freecodecamp.com/gml133f' style='margin-left: 5px' target='_blank'>FCC <i class='fa fa-free-code-camp'></i></a>");
					});
				});

			}

			else {

				$(".modal_bg").fadeOut(200, function() {
					$("#modal_bg").css("display", "none");

					eventsSetup.resetSearch();

					var followed = "Channel : " + name + " is already followed"; 
					$(".channel_notification").html(followed).css("background", "rgba(0,0,0,0.7)");
					$(".channel_notification").fadeIn(300).delay(3000).fadeOut(300, function() {
						$(".channel_notification").html("&copy;GML 2017 | Twitch.tv App |<a href='https://www.freecodecamp.com/gml133f' style='margin-left: 5px' target='_blank'>FCC <i class='fa fa-free-code-camp'></i></a>");
					});
				});

			}

		});

		eventsSetup.footerHeight();

	},

	// Checks if channel is already followed, returns booleean
	alreadyFollowed: function(name) {
		
		for (var i = 0; i < channels.followed.length; i++) {
			if (channels.followed[i] === name) {
				return true;
			}
		}
		return false;
	},

	//event listener for delete button and animation
	clickDelete: function() {
		$(".delete").click(function(e) {
			var target;

			if (e.target.className === "delete") {
				target = e.target.parentNode.id;
			}

			else if (e.target.className === "fa fa-trash") {
				target = e.target.parentNode.parentNode.id;
			}

			$("#" + target).fadeOut(400, function() {
				channels.delete(target);
				eventsSetup.footerHeight();

				var followed = "Channel : " + target + " successfully removed"; 
				$(".channel_notification").html(followed).css("background", "rgba(0,0,0,0.7)");
				$(".channel_notification").fadeIn(300).delay(3000).fadeOut(300);
			});


		});
	},

	tabs: function() {
		$(".tabs").click(function click(e) {

			eventsSetup.tabsDisplay(e.target.id);

		});

		
	},

	tabsDisplay: function(target) {
		var containerSize = $(".tabs").width();

		if (target === "all") {
			$(".online").fadeIn(200, function() {
				eventsSetup.footerHeight();
			});
			$(".offline").fadeIn(200, function() {
				eventsSetup.footerHeight();
			});
			$(".close").fadeIn(200, function() {
				eventsSetup.footerHeight();
			});
			$("hr").css("margin-left", containerSize/4);
			eventsSetup.tabState = "all";
		}

		else if (target === "online") {
			$(".online").fadeIn(200, function() {
				eventsSetup.footerHeight();
			});
			$(".offline").fadeOut(200, function() {
				eventsSetup.footerHeight();
			});
			$(".closed").fadeOut(200, function() {
				eventsSetup.footerHeight();
			});
			$("hr").css("margin-left", containerSize/4*2);
			eventsSetup.tabState = "online";
		}

		else if (target === "offline") {
			$(".online").fadeOut(200, function() {
				eventsSetup.footerHeight();
			});
			$(".offline").fadeIn(200, function() {
				eventsSetup.footerHeight();
			});
			$(".closed").fadeIn(200, function() {
				eventsSetup.footerHeight();
			});
			$("hr").css("margin-left", containerSize/4*3);
			eventsSetup.tabState = "offline";
		}
	},

	tabState: "all", 

	links: function() {
		$(".channel_name, .channel_logo").click(function(e) {
			var name;

			if (e.target.className === "channel_logo") {
				name = e.target.parentNode.parentNode.id;
			}

			else if (e.target.className === "channel_name") {
				name = e.target.parentNode.parentNode.parentNode.id;
			}

			var url = "https://www.twitch.tv/"+name;
			window.open(url);
		});
	},

	footerHeight: function() {

		var height = $(window).height();
		var content = $("html").height();

		if (content < height) {
			$(".footer").css("position", "absolute");
		}

		else {
			$(".footer").css("position", "static");
		}

	}

};

channels.getCookie();

$(document).ready(function() {

	channels.updateChannelData();
	eventsSetup.default();
	eventsSetup.showModal();
	eventsSetup.tabs();
	
	var hrWidth = $(".tabs").width()/4;
	$("hr").css("width", hrWidth);
	$("hr").css("margin-left", hrWidth);
	eventsSetup.footerHeight();
});


$(window).resize(function () {
	var hrWidth = $(".tabs").width()/4;
	$("hr").css("width", hrWidth);
	if(eventsSetup.tabState === "all") {
		$("hr").css("margin-left", hrWidth);
	}

	else if(eventsSetup.tabState === "online") {
		$("hr").css("margin-left", hrWidth*2);
	}

	else if(eventsSetup.tabState === "offline") {
		$("hr").css("margin-left", hrWidth*3);
	}

});

