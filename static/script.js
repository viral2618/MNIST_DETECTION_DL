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

function startPosition(e) {
  painting = true;
  draw(e);
}
function endPosition() {
  painting = false;
  ctx.beginPath();
}
function draw(e) {
  if (!painting) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", endPosition);
canvas.addEventListener("mousemove", draw);

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
