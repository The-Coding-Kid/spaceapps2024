from flask import Flask, jsonify
import numpy as np
import time
from numba import njit, prange

app = Flask(__name__)

# Preload the data globally
coors = None
normalized_coors = None

# Optimized normalization with Numba for JIT compilation
@njit(parallel=True)
def normalize_vectors(vectors):
    normalized = np.empty_like(vectors)
    for i in prange(vectors.shape[0]):
        magnitude = np.sqrt(vectors[i, 0] ** 2 + vectors[i, 1] ** 2 + vectors[i, 2] ** 2)
        if magnitude == 0:
            magnitude = 1
        normalized[i, 0] = vectors[i, 0] / magnitude
        normalized[i, 1] = vectors[i, 1] / magnitude
        normalized[i, 2] = vectors[i, 2] / magnitude
    return normalized

# Preload and normalize data in one go
def preload_data():
    global coors, normalized_coors
    # Load the memory-mapped data
    numbers_read = np.memmap('../cleaned_GaiaSource_000000-003111.bin', dtype=np.float32, mode='r+')
    coors = np.reshape(numbers_read, (-1, 3))
    
    # Subtract the origin and normalize in one step
    origin = coors[0]
    coors -= origin  # In-place subtraction
    
    # Precompute normalized coordinates
    normalized_coors = normalize_vectors(coors)

# Ensure data is preloaded before each request (only preloads once)
@app.before_request
def check_data_loaded():
    global coors, normalized_coors
    if coors is None or normalized_coors is None:
        preload_data()

@app.route("/")
def hello_world():
    start_time = time.time()
    
    # Serve the first 5 precomputed coordinates
    response = jsonify({"coors": normalized_coors[:5].tolist(), "time": (time.time() - start_time)})
    
    return response

if __name__ == "__main__":
    app.run(debug=True)