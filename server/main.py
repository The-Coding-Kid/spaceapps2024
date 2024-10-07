from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import time

numbers_read = np.fromfile('./xyzdm/Proxima Cen_combined_xyz.bin', dtype=np.float32)

app = Flask(__name__)
CORS(app)


def group_list(lst):
    return [lst[i:i+5] for i in range(0, len(lst), 5)]

stars_coors = numbers_read.tolist()
coors = group_list(stars_coors)
print(coors[0])

def normalize_vector(c):
    x, y, z = c
    s = pow(x,2) + pow(y,2) + pow(z,2)
    length = pow(s, 0.5)
    if (length <= 0):
        return [0, 0, 0]
    return [x/length, y/length, z/length]

@app.route("/")
def hello_world():
    i = time.time()

    xs = []
    ys= []
    zs = []
    aas = []
    ds = []
    # l1 = [1, 2, 3, 4, 5]
    # print(len(coors[0]))
    for i in range(len(coors)):
        l1 = coors[i]
        if len(l1) != 5:
            continue
        try:
            x = l1[0]
            y = l1[1]
            z = l1[2]
            a = l1[3]
            d = l1[4]
            xs.append(x)
            ys.append(y)
            zs.append(z)
            aas.append(a)
            ds.append(d)
        except:
            pass
        #print(x, y , z)
        #pair = [x-xo, y-yo, z-zo] g
        
    a = time.time()
    return jsonify({
        "x": xs,
        "y":  ys,
        "z": zs,
        "a": aas,
        "d": ds,
        "t": a-i
    })

if __name__ == "__main__":
    app.run(debug=True)