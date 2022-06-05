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
