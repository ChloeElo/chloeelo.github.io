const sidesBox = document.querySelector(".sidesbox");

sidesBox.addEventListener("click", (event) => {
  const redirections = {
    scorelink: () => window.open("index.html"),
    discord: () => window.open("https://discord.com/invite/TsBGYz4VTg"),
    reddit: () => window.open("https://www.reddit.com/r/chloe/"),
    info: () => window.open("info.html"),
  };

  const path = redirections[event.target.classList[1]];

  if (path) {
    path();
  }
});

var ID2Elo = [0]; //Leading zero because IDs start at 1
var ID2Char = [0];
var Rank2ID = [];
var storage = { user: [], nsfw: [], reddit: [] };
var xlim = 0;
var display = "plot";
var sort = "image";
var dataset = "nsfw";
var paint = "score";
var CharRank = [];
var baseline = 200;
var plot = document.getElementById("plot");
var gridlen = 0;
var filterchars = [];
var chars = [
  "Chloe",
  "Albino",
  "Zoe",
  "Lila",
  "Iris",
  "Willow",
  "Colette",
  "Amber",
  "Claire",
  "RPG",
  "Fate",
];
var selID = 0;
var ID2Uri = [];
var plotXs = [];

const displaySelect = document.getElementById("display");
const datasetSelect = document.getElementById("dataset");
const getOrderSelect = document.getElementById("order");
const filterOneSelect = document.getElementById("filter1");
const filterTwoSelect = document.getElementById("filter2");

displaySelect.addEventListener("change", changeDisplay);
datasetSelect.addEventListener("change", handleChange);
getOrderSelect.addEventListener("change", handleChange);
filterOneSelect.addEventListener("change", updateFilter);
filterTwoSelect.addEventListener("change", updateFilter);

const plotSvg = document.getElementById("plot");

plotSvg.addEventListener("mousemove", updateImg);

const paintSelect = document.getElementById("paint");

paintSelect.addEventListener("change", handleChange);

function navTo(uri) {
  window.open(uri);
}

function handleChange() {
  if (dataset != document.getElementById("dataset").value) {
    updateLists();
    return;
  }
  updateLists();
  if (display == "sort") {
    popGrid(1);
  } else {
    drawCanvas();
  }
}

function replaceOptions(select, list) {
  for (a in select.options) {
    select.options.remove(0);
  }
  for (c in list) {
    opt = document.createElement("option");
    opt.text = list[c];
    opt.value = list[c];
    select.add(opt);
  }
}

function updateFilter() {
  const select = document.getElementById("filter1");
  const value = select.value;
  if (value == "All") {
    filterchars = [];
    replaceOptions(select, ["All"].concat(chars));
  } else if (value == "+") {
  } else {
    if (value[0] == "-") {
      filterchars.splice(filterchars.indexOf(value.substring(2)), 1);
    } else {
      filterchars.push(value);
    }
    if (filterchars.length) {
      optchars = [];
      for (let i = 0; i < chars.length; i++) {
        if (filterchars.includes(chars[i])) {
          optchars.push("- " + chars[i]);
        } else {
          optchars.push(chars[i]);
        }
      }
      replaceOptions(select, ["+", "All"].concat(optchars));
    } else {
      replaceOptions(select, ["All"].concat(chars));
    }
  }
  document.getElementById("filter1txt").innerHTML =
    "Filter for " + filterchars.join(" + ");
  handleChange();
}

function navSel() {
  if (!selID) {
    return;
  }
  navTo("https://www.reddit.com/r/chloe/comments/" + ID2Uri[selID]);
}

function filter(id, type, subtype) {
  tags = ID2Char[id].split(":");
  if (tags.length == 1) {
    tags.push("None");
  }
  if (
    (type == "All" || filterchars.includes(tags[0])) &&
    (subtype == "All" || subtype == tags[1])
  ) {
    return 1;
  }
  return 0;
}

function popGrid(from) {
  let filtered = [];
  let type = document.getElementById("filter1").value;
  let subtype = document.getElementById("filter2").value;
  let rem = 0;
  console.log("sort", sort);
  if (sort == "image" || sort == "-image") {
    for (let i = 1; i < ID2Char.length; i++) {
      if (sort == "-image") {
        id = ID2Char.length - i;
      } else {
        id = i;
      }
      if (filter(id, type, subtype)) {
        filtered.push(id);
      }
      if (filtered.length == gridlen) {
        rem = ID2Char.length - id;
        break;
      }
    }
  }
  if (sort == "score" || sort == "-score") {
    for (let i = Rank2ID.length; i > 0; i--) {
      if (sort == "-score") {
        id = Rank2ID[Rank2ID.length - i];
      } else {
        id = Rank2ID[i - 1];
      }
      if (filter(id, type, subtype)) {
        filtered.push(id);
      }
      if (filtered.length == gridlen) {
        rem = i;
        break;
      }
    }
  }
  console.log("rem", rem);
  if (rem < 50) {
    document.getElementById("load50").style.display = "none";
  } else {
    document.getElementById("load50").style.display = "inherit";
  }
  if (rem < 25) {
    document.getElementById("load25").style.display = "none";
  } else {
    document.getElementById("load25").style.display = "inherit";
  }
  if (rem == 0) {
    document.getElementById("load10").style.display = "none";
  } else {
    document.getElementById("load10").style.display = "inherit";
  }
  for (var i = from; i < gridlen + 1; i++) {
    if (i > filtered.length) {
      document.getElementById("gd" + i).style.display = "none";
      document.getElementById("gi" + i).style.display = "none";
      document.getElementById("gt" + i).style.display = "none";
    } else {
      id = filtered[i - 1];
      document.getElementById("gd" + i).style.display = "inherit";
      document.getElementById("gi" + i).style.display = "inherit";
      document.getElementById("gt" + i).style.display = "inherit";
      document.getElementById("gi" + i).src =
        "Images/" + id.toString().padStart(3, "0") + ".jpg";
      let uri = ID2Uri[id];
      document.getElementById("gi" + i).onclick = function () {
        navTo("https://www.reddit.com/r/chloe/comments/" + uri);
      };
      console.log(document.getElementById("gi" + i).onclick);
      document.getElementById("gt" + i).innerHTML =
        "#" + id + " " + ID2Char[id] + " " + ID2Elo[id];
    }
  }
}

function mkElement(type, id, clas) {
  const newel = document.createElement(type);
  if (id) {
    newel.setAttribute("id", id);
  }
  if (clas) {
    newel.setAttribute("class", clas);
  }
  return newel;
}

function genGrid(len) {
  console.log("gengrid", len, gridlen);
  if (gridlen) {
    wrapbox.removeChild(document.getElementById("loadmore"));
  }
  box = document.getElementById("wrapbox");
  for (var i = gridlen + 1; i < gridlen + len + 1; i++) {
    const newdiv = mkElement("div", "gd" + i, "griddiv grid");
    const newimg = mkElement("img", "gi" + i, "gridimg grid");
    const newtxt = mkElement("h4", "gt" + i, "gridtxt grid");
    newtxt.innerHTML = "Loading...";
    box.appendChild(newdiv);
    newdiv.appendChild(newimg);
    newdiv.appendChild(newtxt);
  }
  const newdiv = mkElement("div", "loadmore", "griddiv grid");
  let newgen = mkElement("u", "load10", "loadmoretxt grid");
  newgen.innerHTML = "<u>Load 10 more";
  newgen.addEventListener("click", function () {
    genGrid(10);
  });
  newdiv.appendChild(newgen);
  newgen = mkElement("u", "load25", "loadmoretxt grid");
  newgen.innerHTML = "Load 25 more";
  newgen.addEventListener("click", function () {
    genGrid(25);
  });
  console.log(newgen);
  newdiv.appendChild(newgen);
  newgen = mkElement("u", "load50", "loadmoretxt grid");
  newgen.innerHTML = "Load 50 more";
  newgen.addEventListener("click", function () {
    genGrid(50);
  });
  newdiv.appendChild(newgen);
  box.appendChild(newdiv);

  gridlen = gridlen + len;
  console.log("gridlen", gridlen);
  updateFilter();
}

function changeDisplay() {
  console.log("changeDisplay");
  display = document.getElementById("display").value;
  if (display == "sort") {
    if (!gridlen) {
      genGrid(60);
    } else {
      popGrid(1);
    }
    for (let part of document.getElementsByClassName("plot")) {
      part.style.display = "none";
    }
    for (let part of document.getElementsByClassName("grid")) {
      part.style.display = "inherit";
    }
    let selectorder = document.getElementById("order");
    if (selectorder.value != "image") {
      selectorder.value = "image";
      handleChange();
    }
    selectorder.remove(4);
    selectorder.remove(3);
    selectorder.remove(2);
    selectorder.remove(1);
    let optionchar = document.createElement("option");
    optionchar.text = "Score";
    optionchar.value = "score";
    selectorder.add(optionchar);
    optionchar = document.createElement("option");
    optionchar.text = "- Image";
    optionchar.value = "-image";
    selectorder.add(optionchar);
    optionchar = document.createElement("option");
    optionchar.text = "- Score";
    optionchar.value = "-score";
    selectorder.add(optionchar);
  } else {
    for (let part of document.getElementsByClassName("plot")) {
      part.style.display = "inherit";
    }
    for (let part of document.getElementsByClassName("grid")) {
      part.style.display = "none";
    }
    let selectorder = document.getElementById("order");
    if (selectorder.value == "-image") {
      selectorder.value = "image";
      sort = "image";
    } else if (selectorder.value == "-score") {
      selectorder.value = "score";
      sort = "score";
    }
    selectorder.remove(3);
    selectorder.remove(2);
    selectorder.remove(1);
    let optionchar = document.createElement("option");
    optionchar.text = "User Elo";
    optionchar.value = "user";
    selectorder.add(optionchar);
    optionchar = document.createElement("option");
    optionchar.text = "NSFW Elo";
    optionchar.value = "nsfw";
    selectorder.add(optionchar);
    optionchar = document.createElement("option");
    optionchar.text = "Reddit Karma";
    optionchar.value = "reddit";
    selectorder.add(optionchar);
    optionchar = document.createElement("option");
    optionchar.text = "Character";
    optionchar.value = "char";
    selectorder.add(optionchar);
    handleChange();
  }
}

var charColors = {
  //Note H,S in HSL
  Chloe: [215, 100],
  Albino: [10, 100],
  Zoe: [55, 100],
  Lila: [285, 100],
  Iris: [40, 100],
  Willow: [85, 75],
  Colette: [0, 60],
  Amber: [45, 25],
  Claire: [250, 75],
  RPG: [0, 0],
  Fate: [300, 100],
};

function charSort() {
  var groups = [[], [], [], [], [], [], [], [], [], [], []];
  CharRank = [];
  console.log("Rank2ID", Rank2ID, xlim);
  for (var i = 0; i < xlim; i++) {
    var id = Rank2ID[i];
    group = chars.indexOf(ID2Char[id].split(":")[0]);
    groups[group].push(id);
  }
  for (var i = 0; i < groups.length; i++) {
    CharRank.push.apply(CharRank, groups[i]);
  }
}

function updateLists() {
  display = document.getElementById("display").value;
  if (sort != document.getElementById("order").value) {
    sort = document.getElementById("order").value;
    if (display == "plot" && ["user", "nsfw", "reddit"].includes(sort)) {
      let t2,
        t3 = ID2Char,
        Rank2ID;
      getData(sort, "order");
      ID2Char, (Rank2ID = t2), t3;
    }
    if (["user", "nsfw", "reddit"].includes(sort)) {
      document.getElementById("paint").value = "score";
    }
    if (sort == "char") {
      document.getElementById("paint").value = "char";
    }
  }
  paint = document.getElementById("paint").value;
  if (dataset != document.getElementById("dataset").value) {
    dataset = document.getElementById("dataset").value;
    document.getElementById("legend").innerHTML = "";
    if (display == "plot") {
      getData(dataset, "dataset");
    } else {
      getData(dataset, "dataset");
    }
  }
}

function updateImg(e) {
  if (plot.lastChild == null) {
    return 0;
  } // Check if canvas is drawn yet
  var x = Math.floor(e.clientX - plot.getBoundingClientRect().left - 1);
  if (x < 0 || x >= xlim) {
    return;
  } // Check mouse is inside canvas
  if (sort == "image") {
    x = x + 1;
  } //Image starts at 1, rank at 0
  if (plotXs.length < Rank2ID.length) {
    let minX = plotXs[0];
    let minVal = Math.abs(plotXs[0] - x);
    for (var i = 0; i < plotXs.length - 1; i++) {
      if (Math.abs(plotXs[i] - x) < minVal) {
        minX = plotXs[i];
        minVal = Math.abs(plotXs[i] - x);
      }
      if (!minVal) {
        break;
      }
    }
    x = minX;
  }
  if (sort == "image") {
    id = x;
  } else if (["user", "nsfw", "reddit"].includes(sort)) {
    var id = Rank2ID[x];
  } else {
    var id = CharRank[x];
  }
  if (paint == "score" && dataset != "reddit") {
    color = "rgb(100,100,255)";
  } else {
    color = "black";
  }
  plot.removeChild(plot.lastChild); // Remove last indicator
  if (paint == "scatter") {
    baseline = 400;
  }
  if (dataset == "reddit") {
    drawLine(plot, x, 400, 400 - (4 * ID2Elo[id]) / 300, color);
  } else {
    drawLine(plot, x, baseline, 400 - 0.4 * (ID2Elo[id] - 1000), color);
  }
  if (dataset == "reddit") {
    var legendText =
      "Image " + id + "<br>" + ID2Char[id] + "<br>Karma " + ID2Elo[id];
  } else {
    var legendText =
      "Image " + id + "<br>" + ID2Char[id] + "<br>Elo " + ID2Elo[id];
  }
  if (["user", "nsfw", "reddit"].includes(sort)) {
    legendText = legendText + "<br>Rank " + x;
  }
  document.getElementById("legend").innerHTML = legendText;
  var simg = document.getElementById("simg"); // Update selection image
  simg.src = "Images/" + id.toString().padStart(3, "0") + ".jpg";
  selID = id;
}

function drawLine(plot, x, y1, y2, color) {
  let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttributeNS(null, "x", x - 0.5);
  rect.setAttributeNS(null, "width", "2");
  if (y2 > y1) {
    rect.setAttributeNS(null, "y", y1);
    rect.setAttributeNS(null, "height", y2 - y1);
  } else {
    rect.setAttributeNS(null, "y", y2);
    rect.setAttributeNS(null, "height", y1 - y2);
  }
  rect.setAttributeNS(null, "fill", color);
  rect.setAttributeNS(null, "stroke", "none");
  plot.appendChild(rect);
}

function drawCircle(plot, x, y, r, color) {
  let circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circ.setAttributeNS(null, "cx", x);
  circ.setAttributeNS(null, "cy", y);
  circ.setAttributeNS(null, "r", r);
  circ.setAttributeNS(null, "fill", color);
  plot.appendChild(circ);
}

function drawCanvas() {
  while (plot.lastChild) {
    // Purge all bars from plot
    plot.removeChild(plot.lastChild);
  }
  plotXs = [];
  plot.setAttribute("width", xlim);

  let back = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  back.setAttributeNS(null, "width", "100%"); // Draw background white
  back.setAttributeNS(null, "height", "100%");
  back.setAttributeNS(null, "fill", "white");
  plot.appendChild(back);

  let type = document.getElementById("filter1").value;
  let subtype = document.getElementById("filter2").value;
  for (var i = 0; i < xlim; i++) {
    // Draw each elo score as a bar plot
    if (sort == "char") {
      var id = CharRank[i];
      console.log(CharRank, i);
    } else {
      var id = Rank2ID[i];
    }
    if (!filter(id, type, subtype)) {
      continue;
    }
    let score = ID2Elo[id];
    let y = 0;
    let r = 0;
    let g = 0;
    if (score > 1500) {
      r = 10 * Math.sqrt(score - 1500);
    } // Elo score red/green color
    else {
      g = 10 * Math.sqrt(1500 - score);
    }
    baseline = 200;
    x = i;
    if (sort == "image") {
      x = id;
    }
    plotXs.push(x);
    if (dataset == "reddit") {
      y = 400 - (4 * score) / 300;
      baseline = 400;
    } else {
      y = 400 - 0.4 * (score - 1000);
    }
    if (paint == "scatter") {
      drawCircle(plot, x, y, 1, "black");
      continue;
    }
    if (paint == "score") {
      if (dataset == "reddit") {
        color =
          "hsl(" +
          (300 / (1 + Math.exp((score - 9000) / 4000))).toString() +
          ",75%,50%)";
      } // Shifted sigmoid function rainbow
      //if (dataset=='reddit') { color = 'hsl('+((120*Math.sqrt(score)/Math.sqrt(25000))+230).toString()+',100%,50%)' }
      else {
        color = "rgb(" + r.toString() + "," + g.toString() + ",0)";
      }
    } else {
      Char = ID2Char[id];
      console.log(i, CharRank, Rank2ID, ID2Char);
      charColor = charColors[Char.split(":")[0]];
      let L = 50;
      if (paint == "type") {
        // Change lightness based on subtype
        let type = ID2Char[id].split(":");
        type = type[type.length - 1];
        if (type == "Cat") {
          L = L - 20;
        }
        if (type == "Hoodie") {
          L = L + 15;
        }
        if (type == "Cosplay") {
          L = L + 30;
        }
      }
      color = "hsl(" + charColor[0] + "," + charColor[1] + "%," + L + "%)";
      baseline = 400;
    }
    drawLine(plot, x, baseline, y, color);
  }
  if (paint == "score" && dataset != "reddit") {
    let axis = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    axis.setAttributeNS(null, "y", "199");
    axis.setAttributeNS(null, "width", "100%");
    axis.setAttributeNS(null, "height", "1");
    axis.setAttributeNS(null, "fill", "black");
    plot.appendChild(axis);
  }
  console.log(plotXs, Rank2ID.length);
  drawLine(plot, 0, 0, 0, "white"); // Placeholder for indicator removal
}

function getData(type, update) {
  console.log(type, storage[type]);
  if (type != "uris" && storage[type].length) {
    if (update != "order") {
      ID2Elo = storage[type][0];
      ID2Char = storage[type][1];
      xlim = ID2Elo.length - 1;
    }
    if (update != "dataset") {
      Rank2ID = storage[type][2];
      ID2Char = storage[type][1];
      xlim = Rank2ID.length;
      charSort();
    }
    handleChange();
    return;
  }
  document.getElementById("legend").innerHTML = "Loading...";
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
      if (type == "uris") {
        let nested = JSON.parse("[" + xhr.response + "]")[0];
        ID2Uri.push(0);
        for (var i = 0; i < nested.length; i++) {
          ID2Uri.push(nested[i][0]);
        }
        console.log(ID2Uri);
        if (display == "sort") {
          handleChange();
        }
        return;
      }
      let tID2Elo = [0];
      tID2Char = [0];
      tRank2ID = [];
      var ratings = JSON.parse("[" + xhr.response + "]")[0];
      //console.log(ratings[0][2])
      for (var i = 0; i < ratings.length; i++) {
        tID2Elo.push(ratings[i][0]);
        tID2Char.push(ratings[i][1]);
        tRank2ID.push(ratings[i][2]);
      }
      storage[type].push(tID2Elo, tID2Char, tRank2ID);
      if (update != "order") {
        ID2Elo = storage[type][0];
        ID2Char = storage[type][1];
        xlim = ID2Elo.length - 1;
      }
      if (update != "dataset") {
        Rank2ID = storage[type][2];
        ID2Char = storage[type][1];
        xlim = Rank2ID.length;
        charSort();
      }
      console.log(storage);
      handleChange();
      document.getElementById("legend").innerHTML = "Loading Complete";
    }
  };
  xhr.send("type=" + type);
}

getData("nsfw", "both"); // change before live
getData("uris", "none");
updateFilter();
