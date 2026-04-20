from flask import Flask, render_template, send_from_directory

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/sw.js")
def service_worker():
    # Serve the service worker from the root so its scope is the whole app.
    response = send_from_directory(app.static_folder, "sw.js")
    response.headers["Service-Worker-Allowed"] = "/"
    response.headers["Cache-Control"] = "no-cache"
    return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
