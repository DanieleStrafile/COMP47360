from flask import Flask, render_template, g, jsonify


app = Flask(__name__)


@app.route('/')
def main():
	""" displays the index page accessible at '/' """

	return render_template("index.html",
							title = "Home",
							heading = "Dublin Bus")


if __name__ == "__main__":
	app.run(debug=True)