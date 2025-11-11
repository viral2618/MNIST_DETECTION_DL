const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const predictBtn = document.getElementById('predictBtn');
const result = document.getElementById('result');

// Draw uploaded image on canvas
imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw image resized to 280x280
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
});

// Send image to backend for prediction
predictBtn.addEventListener('click', async () => {
    if (!imageInput.files[0]) {
        alert("Please select an image first!");
        return;
    }

    const formData = new FormData();
    formData.append('image', imageInput.files[0]);

    result.textContent = "Prediction: ⏳";

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.prediction !== undefined) {
            result.textContent = `Prediction: ${data.prediction}`;
        } else {
            result.textContent = `Error: ${data.error}`;
        }
    } catch (err) {
        result.textContent = `Error: ${err}`;
    }
});
