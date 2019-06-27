const express = require("express");
const hbs = require("hbs");

const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:

const clientId = "c7af3e16c49048d9950a2ba575d78eb7",
  clientSecret = "fd2ed66b43134f21bd88881a41f4394b";

const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret
});

spotifyApi
  .clientCredentialsGrant()
  .then(data => {
    spotifyApi.setAccessToken(data.body["access_token"]);
    console.log("Tokken aqcuired");
    console.log(spotifyApi);
  })
  .catch(error => {
    console.log("Something went wrong when retrieving an access token", error);
  });

app.get("/", (req, res, next) => {
  res.render("index", {});
});

app.get("/artists", (req, res, next) => {
  // console.log("Querried Artist: ", req.query.artist);
  console.log("TCL: req.query.artist", req.query.sorton);
  spotifyApi
    .searchArtists(req.query.artist)
    .then(data => {
      // console.log(data.body.artists.items);
      if ((req.query.sorton = "popularity")) {
        data.body.artists.items.sort((a, b) => a.popularity - b.popularity);
        console.log("sorted pop");
      } else {
        data.body.artists.items.sort(
          (a, b) => b.followers.total - a.followers.total
        );
        console.log("sorted fol");
      }
      res.render("artists", {
        artists: data.body.artists.items,
        simpleUrl: "/artists?artist=" + req.query.artist
      });
    })
    .catch(err => {
      console.log("The error while searching artists occurred: ", err);
    });
});

app.get("/albums/:id", (req, res, next) => {
  spotifyApi
    .getArtistAlbums(req.params.id)
    .then(data => {
      console.log("Artist albums", data.body.items);
      res.render("albums", {
        albums: data.body.items
      });
    })
    .catch(err => {
      console.error(err);
    });
});

app.get("/tracks/:id", (req, res, next) => {
  spotifyApi
    .getAlbumTracks(req.params.id)
    .then(data => {
      console.log("Artist albums tracks", data.body.items);
      res.render("tracks", {
        tracks: data.body.items.map(track => ({
          ...track,
          duration: convertToMinutes(track.duration_ms)
        }))
      });
    })
    .catch(err => {
      console.error(err);
    });
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);

function sortOnPopularity() {
  return new Promise(function(resolve, reject) {
    data.body.artists.items.sort((a, b) => a.popularity - b.popularity);
    if (true) {
      resolve("Stuff worked!");
    } else {
      reject(Error("It broke"));
    }
  });
}

function sortOnFollower() {
  return new Promise(function(resolve, reject) {
    data.body.artists.items.sort(
      (a, b) => a.followers.total - b.followers.total
    );
    if (true) {
      resolve("Stuff worked!");
    } else {
      reject(Error("It broke"));
    }
  });
}

function convertToMinutes(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds % 60);
  let secondsLeft = seconds - (minutes* 60);
  let minutesString = "0" + minutes;
  let secondsString = "00" + secondsLeft;
  return ` ms: ${ms}, seconds: ${seconds}, minutes: ${minutes}, secondsLeft: ${secondsLeft}`
}
