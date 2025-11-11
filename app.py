from flask import Flask, request, jsonify, render_template
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
model = load_model('MNist.keras')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']

    try:
        # Read image
        img = Image.open(io.BytesIO(file.read())).convert('L')
        img = img.resize((28, 28))

        # Convert to numpy
        img_array = np.array(img).astype('float32')

        # Invert colors: make white background → 0 and black digit → 255
        img_array = 255 - img_array

        # Normalize
        img_array = img_array / 255.0

        # Reshape for CNN input
        img_array = img_array.reshape(1, 28, 28, 1)

        # Predict
        prediction = model.predict(img_array)
        predicted_class = int(np.argmax(prediction, axis=1)[0])

        return jsonify({'prediction': predicted_class})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
