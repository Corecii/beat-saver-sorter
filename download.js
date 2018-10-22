(function f() {
	const request = require("request-promise");
	const fs = require("fs-extra");

	const max = 10000;
	let songs = [];

	(async function() {
		let initResponse = await request({
			mode: "GET",
			url: `https://beatsaver.com/api/songs/new/0`,
			json: true
		});
		let promises = [];
		for (let i = 0; i < initResponse.total + 100; i += 20) {
			promises.push(new Promise(async (resolve, reject) => {
				let response = await request({
					mode: "GET",
					url: `https://beatsaver.com/api/songs/new/${i}`,
					json: true
				});
				let num = i;
				if (!response.songs[num]) {
					if (!response.songs[0])
						return resolve();
					num = 0;
				}
				while (response.songs[num]) {
					songs.push(response.songs[num]);
					num++;
					if (songs.length == max)
						break;
				}
				console.log(`Downloaded ${songs.length}/${response.total}`);
				resolve();
			}));
		}
		await Promise.all(promises);
		await fs.writeJson("beatsaver-songs.json", songs);
		console.log("Done");
	})();
})();