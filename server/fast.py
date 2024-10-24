from flask import Flask, Response
from flask_cors import CORS
import numpy as np
import orjson  # For super-fast JSON serialization
import time

# Path to the binary file
file_path = './xyzdm/Proxima Cen_combined_xyz.bin'

# Load and memory-map the large binary file
data_memmap = np.memmap(file_path, dtype=np.float32, mode='r')

# Calculate the total number of elements and the number of valid rows (divisible by 5)
num_elements = len(data_memmap)
num_rows = num_elements // 5

# Truncate the data to only valid sets of 5 elements (x, y, z, a, d)
valid_data = data_memmap[:num_rows * 5].reshape(-1, 5)

# Pre-process the data into chunks for faster access
chunk_size = 10000000  # 10 million elements per chunk, adjust as needed
precomputed_chunks = []
for i in range(0, num_rows, chunk_size):
    precomputed_chunks.append(valid_data[i:i + chunk_size])

# In-memory cache for chunks (this replaces Redis)
cache = {}

app = Flask(__name__)
CORS(app)

def get_chunk(chunk_index=0):
    """
    Fetch a precomputed chunk from memory cache.
    Default chunk_index is 0 (the first chunk).
    """
    # Check if the chunk is cached in memory
    if chunk_index in cache:
        return cache[chunk_index]  # Return cached chunk if available
    
    # Fetch the precomputed chunk from RAM
    chunk = precomputed_chunks[chunk_index]
    result = {
        "x": chunk[:, 0].tolist()[0:7500],
        "y": chunk[:, 1].tolist()[0:7500],
        "z": chunk[:, 2].tolist()[0:7500],
        "a": chunk[:, 3].tolist()[0:7500],
        "d": chunk[:, 4].tolist()[0:7500],
    }
    
    # Cache the result in memory for future lookups
    cache[chunk_index] = result
    return result

@app.route("/")
def get_default_chunk():
    """
    This function returns the first chunk (or the default chunk).
    No URL parameters are needed. It defaults to chunk 0.
    """
    # Track start time for performance monitoring
    start_time = time.time()

    # Fetch the default chunk (chunk 0)
    response_data = get_chunk(0)  # You can change the index here if needed

    # Serialize the response using orjson for high performance
    serialized_response = orjson.dumps(response_data)

    # Track end time and print for debugging
    end_time = time.time()
    print(f"Request processing time: {end_time - start_time:.6f} seconds")

    # Return the response
    return Response(serialized_response, content_type="application/json")

if __name__ == "__main__":
    # Run Flask with threading for concurrency
    app.run(debug=False, threaded=True, port=3500)