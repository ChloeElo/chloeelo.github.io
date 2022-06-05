function makeid(length) {
  var result = "";
  var charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}
var uid = makeid(5);
console.log("Session ID:", uid);

var noop = function () {};
var images = [];
var imgids = [];
var index = 0;
var ID2Elo = [0]; //Leading zero because IDs start at 1
var ID2Char = [0];
var Rank2ID = [];
var pairqueue = [];
var lasttime = Date.now();

function getElo() {
  var xhr = new XMLHttpRequest();
  xhr.open(
    "POST",
    "https://script.google.com/macros/s/AKfycbzqe2AK7p8Ku46cVYqBrsHlkjUWrxkEuJLZ-r_6DG5m-0UCOTVNVou1YG9BzgPH3HGdiw/exec",
    true
  );
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    // Call a function when the state changes.
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      var ratings = JSON.parse("[" + xhr.response + "]")[0];
      for (var i = 0; i < ratings.length; i++) {
        ID2Elo.push(ratings[i][0]);
        ID2Char.push(ratings[i][1]);
        Rank2ID.push(ratings[i][2]);
      }
      genPairQ();
    }
  };
  xhr.send("type=nsfw");
}

getElo();

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function genPairQ() {
  //Must load elo before calling
  pairqueue = [];
  let search = 4;
  for (var i = 1; i < Rank2ID.length - 1; i++) {
    let d = Math.floor(2 * search * Math.random()) - search;
    if (d >= 0) {
      d = d + 1;
    } // Avoid zero, shift positive up
    let b = i + d;
    if (b < 0) {
      b = 0;
    }
    if (b > Rank2ID.length - 1) {
      b = Rank2ID.length - 1;
    } // Clip lower end, note this increases prob of ends in pair
    pairqueue.push([i, b]);
  }
  shuffleArray(pairqueue);
}

function getPairID() {
  //return getRandomID(1,693,2)
  if (Rank2ID.length == 0) {
    return getRandomID(1, 693, 2);
  }
  pair = pairqueue.pop();
  a = pair[0];
  b = pair[1];
  if (pairqueue.length == 0) {
    genPairQ();
  }
  console.log(
    "Count",
    count + 1,
    "Load Rankings:",
    a,
    b,
    "IDs:",
    Rank2ID[a],
    Rank2ID[b]
  );
  return [Rank2ID[a], Rank2ID[b]];
}

function getRandomID(min, max, len) {
  let arr = [];
  while (arr.length < len) {
    let r = Math.floor(Math.random() * (max - min + 1)) + min;
    if (imgids.indexOf(r) === -1 && arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}

imgids = imgids.concat(getPairID());

function preloadImages(ids, imgs, callback) {
  var img;
  var remaining = ids.length;
  for (var i = 0; i < ids.length; i++) {
    img = new Image();
    img.onload = function () {
      --remaining;
      if (remaining <= 0) {
        callback();
      }
    };

    img.src = "Images/" + ids[i].toString().padStart(3, "0") + ".jpg";
    imgs.push(img);
  }
}

preloadImages(imgids, images, noop);
