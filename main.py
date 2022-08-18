from quart import Quart
from quart import render_template
from quart import session
from quart import request

app = Quart(__name__,static_folder='static')

@app.route('/')
@app.route('/home')
async def index():
    print(request.cookies.get("ds"))
    return await render_template("home.html")

@app.route("/cdn-cgi/rum",methods=["POST"])
async def cdn_cgi():
       return ""

@app.route('/leaderboard')
@app.route('/leaderboard/<mode>/<sort>')
async def hello(mode='osu', sort='pp'):
    return await render_template("leaderboard.html",mode=mode,sort=sort)


app.run(port=8080,host="0.0.0.0",debug=True)