(async function() {
	const fs = require("fs-extra");
	const sprintf = require("sprintf");
	const moment = require("moment");

	const maxDisplay = 100;
	const songFormat = "%4d: %60s%1s%40s %10s %+5d %+5d = %-5d %5d %7d %7d";
	const pointsPerDay = 1.25/30;
	const songsFolder = "D:/Steam/steamapps/common/Beat Saber/CustomSongs";

	let songs = await fs.readJson("beatsaver-songs.json");

	function getBaseLog(b, x) {
	  return Math.log(x) / Math.log(b);
	}

	for (let song of songs) {
		let unixTimestamp = new Date(song.createdAt.date).getTime()/1000;
		let upVotes = parseInt(song.upVotes);
		song.upVotesTotal = upVotes;
		let downVotes = parseInt(song.downVotes);
		song.downVotesTotal = downVotes;
		let score = upVotes - downVotes;
		song.score = score;
		let plays = song.playedCount;
		let downloads = parseInt(song.downloadCount);
		song.downloadsCountInt = downloads;
		let nowTimestamp = new Date().getTime()/1000;
		let playRate = plays/((nowTimestamp - unixTimestamp)/(60*60*24));
		song.playRate = playRate;
		let orderScore =
			unixTimestamp/(60*60*24)*pointsPerDay + getBaseLog(10, Math.max(1, plays)) + getBaseLog(10, Math.max(1, score));
		song.orderScore = orderScore;
	}
	songs.sort((a, b) => {
		return b.orderScore - a.orderScore;
	});
	console.log(sprintf("%-48s %57s %11s %5s %5s %7s %5s %7s %8s", "Index", "Title", "Created", "Up", "Down", "Total", "Pl/d", "Plays", "Download"));
	let index = 0;
	let now = moment();
	for (let song of songs) {
		if (!(await fs.pathExists(songsFolder+"/"+song.id)) && !(await fs.pathExists(songsFolder+"/"+song.key)) && !(await fs.pathExists(songsFolder+"/"+song.songName))) {
			let days = moment(song.createdAt.date).fromNow(true); //Math.floor(moment.duration(now.diff(moment(song.createdAt.date))).asDays()) + " days";
			let identifier = index%2 == 0 ? "*" : " "
			console.log(sprintf(songFormat, ++index, `${song.authorName} (${song.songSubName})`, identifier, `${song.songName}${identifier}`, days, song.upVotesTotal, -song.downVotesTotal, song.score, song.playRate, song.playedCount, song.downloadsCountInt));
			if (index == maxDisplay) {
				break;
			}
		}
	}
})();