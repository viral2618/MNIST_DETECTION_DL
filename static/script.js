const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const clearBtn = document.getElementById("clear");
const predictBtn = document.getElementById("predict");
const resultBox = document.getElementById("result");
const resultValue = document.getElementById("prediction-value");

let painting = false;

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.lineWidth = 20;
ctx.lineCap = "round";
ctx.strokeStyle = "black";

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) { 
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  } else { 
    return {
      x: e.offsetX,
      y: e.offsetY,
    };
  }
}

function startPosition(e) {
  e.preventDefault();
  painting = true;
  draw(e);
}
function endPosition(e) {
  e.preventDefault();
  painting = false;
  ctx.beginPath();
}
function draw(e) {
  e.preventDefault();
  if (!painting) return;
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}


canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", endPosition);
canvas.addEventListener("mousemove", draw);


canvas.addEventListener("touchstart", startPosition);
canvas.addEventListener("touchend", endPosition);
canvas.addEventListener("touchmove", draw);

clearBtn.addEventListener("click", () => {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  resultBox.classList.add("hidden");
});

predictBtn.addEventListener("click", async () => {
  const image = canvas.toDataURL("image/png");
  const blob = await (await fetch(image)).blob();
  const formData = new FormData();
  formData.append("image", blob, "digit.png");

  resultValue.innerText = "⏳";
  resultBox.classList.remove("hidden");

  const response = await fetch("/predict", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data.prediction !== undefined) {
    resultValue.innerText = data.prediction;
  } else {
    resultValue.innerText = "❌";
  }
});
