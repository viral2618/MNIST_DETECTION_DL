from flask import Flask, request, jsonify, render_template
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import os

app = Flask(__name__)

# Load TFLite model once at startup
interpreter = tf.lite.Interpreter(model_path=os.path.join(os.path.dirname(__file__), "mnist_cnn.tflite"))
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

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

        # Convert to numpy array
        img_array = np.array(img).astype('float32')

        # Invert colors if needed (depending on training)
        img_array = 255 - img_array

        # Normalize
        img_array = img_array / 255.0

        # Reshape for TFLite input
        img_array = img_array.reshape(1, 28, 28, 1)

        # TFLite prediction
        interpreter.set_tensor(input_details[0]['index'], img_array)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])
        predicted_class = int(np.argmax(output_data[0]))

        return jsonify({'prediction': predicted_class})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    # Use host='0.0.0.0' for Render deployment
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
