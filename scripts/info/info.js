const sidesBox = document.querySelector(".sidesbox");

sidesBox.addEventListener("click", (event) => {
  const redirections = {
    ranklink: () => window.open("index.html"),
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
