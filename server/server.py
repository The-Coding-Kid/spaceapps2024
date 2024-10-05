from flask import Flask, jsonify
import pandas as pd
import numpy as np

numbers_read = np.fromfile('../cleaned_GaiaSource_000000-003111.bin', dtype=np.float32)

app = Flask(__name__)

#Helper Methods:
def group_list(lst):
    return [lst[i:i+3] for i in range(0, len(lst), 3)]

@app.route("/")
def hello_world():
    json = numbers_read.tolist()
    print(numbers_read.size)
    print(numbers_read.shape)
    return jsonify(group_list(json)[0])

if __name__ == "__main__":
    app.run(debug=True)