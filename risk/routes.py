from risk import app
from flask import render_template, jsonify
import pandas as pd


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/data")
def data():

    df = pd.read_csv("risk/data/data.csv")

    return jsonify(df.to_dict(orient="records"))


@app.route("/corr")
def corr():

    df = pd.read_csv("risk/data/data.csv")

    # Correlation matrix
    corr_matrix = df.corr()

    # Convert to html string
    corr_html = corr_matrix.to_html(
        classes="table table-bordered table-sm table-hover")

    # Strip newlines
    corr_html = corr_html.replace("\n", "")

    # Create dictionary to hold table
    corr_dict = {}

    # Place html table into dict
    corr_dict["corr_table"] = corr_html

    return jsonify(corr_dict)
