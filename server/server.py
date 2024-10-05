from flask import Flask, jsonify
import numpy as np
import time

# Memory-mapped access to the binary file (read-only)
numbers_read = np.memmap('../cleaned_GaiaSource_000000-003111.bin', dtype=np.float32, mode='r+')

app = Flask(__name__)

 # Memory-map and reshape the 1D array into a 2D array (N x 3)
 # Create a writable copy of the coordinates for modification
coors = np.reshape(numbers_read, (-1, 3))
coors_copy = coors.copy()


# Helper Methods
def normalize_vectors(vectors):
    squared = vectors ** 2
    magnitudes = np.sqrt(squared[:, 0] + squared[:, 1] + squared[:, 2])
    magnitudes = np.where(magnitudes == 0, 1, magnitudes)  # Prevent division by zero
    return vectors / magnitudes[:, np.newaxis]

@app.route("/")
def hello_world():
    i = time.time()

    origin = coors_copy[0]
    
    np.subtract(coors_copy, origin, out=coors_copy)  # Now coors_copy can be modified
    
    # Normalize the coordinates
    normalized_coors = normalize_vectors(coors_copy)
    
    a = time.time()
    
    # Return the first 5 coordinates and the processing time
    return jsonify({"coors": normalized_coors[:5].tolist(), "time": (a - i)})

if __name__ == "__main__":
    app.run(debug=True)