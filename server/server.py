from flask import Flask, Response
import numpy as np
import os
import time
from numba import njit, prange
from multiprocessing import Pool, cpu_count

app = Flask(__name__)

# Define chunk size
CHUNK_SIZE = 10**6  # 1 million rows per chunk

# Path to the binary file
file_path = '../cleaned_GaiaSource_000000-003111.bin'

# Check the file size
file_size = os.path.getsize(file_path)

# Total number of float32 elements in the file
total_elements = file_size // 4  # float32 is 4 bytes

# Total number of 3-element coordinate rows
total_rows = total_elements // 3  # Each row has 3 elements (x, y, z)


@njit(parallel=True)
def normalize_vectors(vectors):
    n = vectors.shape[0]
    normalized = np.empty_like(vectors)
    for i in prange(n):
        magnitude = np.sqrt(vectors[i, 0] ** 2 + vectors[i, 1] ** 2 + vectors[i, 2] ** 2)
        normalized[i] = vectors[i] if magnitude == 0 else vectors[i] / magnitude
    return normalized


# Function to read and normalize a chunk of data
def process_chunk(chunk_index):
    start_row = chunk_index * CHUNK_SIZE
    end_row = min(start_row + CHUNK_SIZE, total_rows)
    num_rows = end_row - start_row

    if num_rows <= 0:
        return np.array([])

    # Memory-map the relevant part of the file for the current chunk
    offset = start_row * 3 * 4  # Each row has 3 elements, each element is 4 bytes (float32)
    chunk_size = num_rows * 3

    numbers_read = np.memmap(file_path, dtype=np.float32, mode='r', offset=offset, shape=(chunk_size,))
    coors = np.reshape(numbers_read, (-1, 3))  # Reshape into (num_rows, 3)

    # Normalize the chunk
    normalized = normalize_vectors(coors)
    return normalized


# Stream normalized data in a generator function
def stream_normalized_data():
    pool = Pool(cpu_count())  # Utilize all available CPUs

    chunk_index = 0
    while chunk_index * CHUNK_SIZE < total_rows:
        # Start time for performance tracking
        start_time = time.time()

        # Submit task to the pool of workers
        result = pool.apply_async(process_chunk, (chunk_index,))

        # Get the result (wait until done)
        normalized_chunk = result.get()

        if normalized_chunk.size == 0:
            break  # No more data

        processing_time = time.time() - start_time

        # Convert to a JSON-like string format for streaming
        yield f'{{"coors": {normalized_chunk[:5].tolist()}, "time": {processing_time}}}\n'

        # Move to the next chunk
        chunk_index += 1


@app.route("/")
def hello_world():
    # Use `Response` to stream the output directly to the client
    return Response(stream_normalized_data(), mimetype='application/json')


if __name__ == "__main__":
    app.run(debug=True)