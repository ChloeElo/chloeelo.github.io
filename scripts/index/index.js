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

window.addEventListener("keyup", keylog);
function keylog(e) {
  //if (info) { document.getElementById("info").classList.toggle('fade'); return}
  if (e.key == "a" || e.keyCode == "37") {
    append("A");
    document.getElementById("greenA").className = "show";
    setTimeout(function () {
      document.getElementById("greenA").className = "green";
    }, 250);
  }
  if (e.key == "d" || e.keyCode == "39") {
    append("B");
    document.getElementById("greenB").className = "show";
    setTimeout(function () {
      document.getElementById("greenB").className = "green";
    }, 250);
  }
  if (e.key == "w" || e.keyCode == "38") {
    both();
  }
  if (e.key == "s" || e.keyCode == "40") {
    next();
    playPage(2);
  }
}

const wrapBox = document.querySelector(".wrapbox");
const bothTwoButton = document.getElementById("both2");
const skipTwobutton = document.getElementById("skip2");
const infoButton = document.getElementById("info");
const achievementToggle = document.querySelector(".sidebar.achtoggle.green");
const sidesBox = document.querySelector(".sidesbox");

wrapBox.addEventListener("click", (event) => {
  const appendOptions = {
    greenA: () => append("A"),
    greenB: () => append("B"),
  };

  const target = event.target;
  const isImage = target.tagName === "IMG";

  if (isImage) {
    appendOptions[target.id]();
  }
});

bothTwoButton.addEventListener("click", both);

skipTwobutton.addEventListener("click", () => {
  next();
  playPage(2);
});

achievementToggle.addEventListener("click", achToggle);

infoButton.addEventListener("click", clearinfo);

sidesBox.addEventListener("click", (event) => {
  const redirections = {
    scorelink: () => window.open("scores.html"),
    discord: () => window.open("https://discord.com/invite/TsBGYz4VTg"),
    reddit: () => window.open("https://www.reddit.com/r/chloe/"),
    info: () => window.open("info.html"),
  };

  const path = redirections[event.target.classList[1]];

  if (path) {
    path();
  }
});

function playPage(num) {
  plays = getRandomID(1, 19, num);
  for (let i = 0; i < plays.length; i++) {
    document.getElementById("p" + plays[i]).play();
  }
}

var achvis = false;
//achcount = [0,1,5,10,20,42,100,159,200,256,313,350,420,456,512,666,729,808,911,1000];
achcount = [
  0, 1, 5, 10, 16, 21, 42, 69, 81, 100, 121, 144, 200, 256, 313, 350, 420, 456,
  512, 666,
];

function achToggle() {
  if (!achvis) {
    for (let i = 1; i < 21; i++) {
      if (achcount[i - 1] > count) {
        break;
      }
      document.getElementById("a" + i).className = "A_bar";
      document.getElementById("s" + i).className = "A_pop";
    }
  } else {
    for (var i = 1; i < 21; i++) {
      console.log(i);
      if (achcount[i] > count) {
        break;
      }
      document.getElementById("a" + i).className = "A_hid";
      document.getElementById("s" + i).className = "A_hid";
    }
    if (i > 20) {
      i = 20;
    }
    document.getElementById("a" + i).className = "A_now";
  }
  achvis = !achvis;
}

function navTo(uri) {
  window.open(uri);
}

function both() {
  playPage(2);
  document.getElementById("greenA").className = "show";
  document.getElementById("greenB").className = "show";
  setTimeout(function () {
    document.getElementById("greenA").className = "green";
    document.getElementById("greenB").className = "green";
  }, 250);
  append("T");
}

var a = 100;
var b = 200;
var prepair;
var count = 0;
index = -2;
var info = 1;
var results = [];
var queue = [];
var batchsize = 10;

function next() {
  ach = achcount.indexOf(count) + 1;
  if (ach) {
    document.getElementById("a" + ach).className = "A_now";
    document.getElementById("s" + ach).className = "A_pop";
    try {
      if (achvis) {
        document.getElementById("a" + (ach - 1)).className = "A_bar";
      } else {
        document.getElementById("a" + (ach - 1)).className = "A_hid";
        document.getElementById("s" + (ach - 1)).className = "A_hid";
      }
    } catch {}
    if (achvis) {
      document.getElementById("a" + ach).style.opacity = 1;
    }
    if (ach == 20) {
      document.getElementById("counterbox").style.display = "block";
      document.getElementById("a").style.top = "75px";
      document.getElementById("s").style.top = "75px";
      if (!achvis) {
        setTimeout(function () {
          achToggle();
        }, 500);
      }
    }
  }

  index = index + 2;
  if (imgids.length > 50) {
    imgids = imgids.slice(-2);
    images = images.slice(-2);
    index = 0;
  }
  prepair = getPairID();
  imgids = imgids.concat(prepair);
  if (count) {
    document.getElementById("fadeA").src = document.getElementById("imgA").src;
    document.getElementById("fadeB").src = document.getElementById("imgB").src;
    document.getElementById("fadeA").className = "show";
    document.getElementById("fadeB").className = "show";
    setTimeout(function () {
      document.getElementById("fadeA").className = "fade";
      document.getElementById("fadeB").className = "fade";
    }, 10);
  }
  document.getElementById("imgA").src = images[index].src;
  document.getElementById("imgB").src = images[index + 1].src;
  document.getElementById("imgA").alt = images[index].src;
  document.getElementById("imgB").alt = images[index + 1].src;
  preloadImages(prepair, images, noop);
}

next();

function append(r) {
  if (Date.now() - lasttime < 250) {
    alert("Slow down and take half a second to look before clicking...");
    return;
  }
  if (r == "T") {
    playPage(2);
  } else {
    playPage(1);
  }
  count = count + 1;
  next();
  lasttime = Date.now();
  document.getElementById("counter").innerHTML = "Counter " + count;
  queue.push([imgids[index], imgids[index + 1], r]);
  if (queue.length >= batchsize) {
    send(queue);
  }
}

function send(squeue) {
  var xhr = new XMLHttpRequest();
  xhr.open(
    "POST",
    "https://script.google.com/macros/s/AKfycbzqe2AK7p8Ku46cVYqBrsHlkjUWrxkEuJLZ-r_6DG5m-0UCOTVNVou1YG9BzgPH3HGdiw/exec",
    true
  );
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    // Call a function when the state changes.
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        console.log("Send success", squeue);
      } else {
        console.log("Send failed", this.status, squeue);
      }
    }
  };
  xhr.send("uid=" + uid + "&data=" + JSON.stringify(squeue) + "&type=send");
}

function clearinfo() {
  info = 0;
  document.getElementById("info").classList.toggle("fade");
}
