from flask import Flask, jsonify
import pandas as pd
import numpy as np
import time

numbers_read = np.fromfile('../cleaned_GaiaSource_000000-003111.bin', dtype=np.float32)

app = Flask(__name__)

def group_list(lst):
    return [lst[i:i+3] for i in range(0, len(lst), 3)]

stars_coors = numbers_read.tolist()
coors = group_list(stars_coors)

#Helper Methods:


# def normalize_vector(c):
#     x, y, z = c
#     s = pow(x,2) + pow(y,2) + pow(z,2)
#     length = pow(s, 0.5)
#     if (length <= 0):
#         return [0, 0, 0]
#     return [x/length, y/length, z/length]

@app.route("/")
def hello_world():
    i = time.time()
    
    #xo, yo, zo = coors[0]
    new_coors = []
    for x, y, z in coors:
        #print(x, y , z)
        #pair = [x-xo, y-yo, z-zo]
        w = (x + y + z) < 4
    a = time.time()
    return jsonify({"coors": [], "time": (a-i)})

if __name__ == "__main__":
    app.run(debug=True)