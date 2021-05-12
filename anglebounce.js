function setup() {
  createCanvas(windowWidth - 5, windowHeight - 5);
  textSize(window.innerHeight / 20)
  curveTightness(0)
  colorMode(HSB, 100)
  new Wall(0, 500, 300, 500)
  new Dot(50, 50, 1, 0, 0, 10, 5)
}

var dotslist = []
var wallist = []
var mainlist = []
var energy = []
var fpms = 10
var dt = 1
var g = 0.2

class Dot {
  constructor(x, y, mass, xsp, ysp, color, size) {
    this.x = x
    this.y = y
    this.xsp = xsp
    this.ysp = ysp
    this.l = createVector(x,y)
    this.v = createVector(xsp,ysp)
    this.color = color
    this.mass = mass
    this.size = size
    dotslist.push(this)
    mainlist.push(this)
  }

  run() {
    this.update()
    this.render()
  }

  update() {
    this.pl = this.l.copy()
    this.pv = this.v.copy()
    this.v.add(0,(g*dt))
    this.l.add((this.v.x+this.pv.x)*dt/2,(this.v.y+this.pv.y)*dt/2)
    this.x = this.l.x
    this.y = this.l.y
    this.py = this.pl.y
    this.px = this.pl.x
    this.m = (this.py - this.y) / (this.px - this.x)
    this.b = this.y - (this.m * this.x)
    if (isFinite(this.m) == false) { //tests for vertical slopes
      this.cx = this.x
    } else if (isFinite(wallist[0].m) == false) {
      this.cx = wallist[0].ax
    } else {
      this.cx = (wallist[0].b - this.b) / (this.m - wallist[0].m)
    }
    this.cy = wallist[0].m * this.cx + wallist[0].b
    if ((btwn(this.x, this.px, this.cx) && btwn(this.y, this.py, this.cy)) && (btwn(wallist[0].ax,wallist[0].bx,this.cx)) && btwn(wallist[0].ay,wallist[0].by,this.cy)) { //collision check
      this.v.reflect(wallist[0].vec.copy().rotate(HALF_PI))
      this.l.add(this.v)
    }
  }

  render() {
    push()
    fill(this.color)
    ellipse(this.l.x, this.l.y, this.size)
    pop()
  }
}

class Wall {
  constructor(ax, ay, bx, by, ...args) {
    this.ax = ax
    this.ay = ay
    this.bx = bx
    this.by = by
    this.m = (by - ay) / (bx - ax)
    this.b = ay - (this.m * ax)
    this.vec = createVector(bx-ax,by-ay)
    wallist.push(this)
    mainlist.push(this)
  }

  run() {
    this.update()
    this.render()
  }

  update() {

  }

  render() {
    push()
    stroke(60, 100, 70)
    strokeWeight(5)
    line(this.ax, this.ay, this.bx, this.by)
    pop()
  }
}



function draw() {
  background(255);
  energy = []
  mainlist.forEach(function(e) {
    e.run()
  })
  if (dt == 0) {
    paused = "Paused"
  } else {
    paused = ""
  }
  text(paused, 20, 65)
  textwall(windowWidth - 150, 20, ["Wallm", wallist[0].b], ["vel", dotslist[0].v.y], ["cy", dotslist[0].cy], ["dotm", dotslist[0].m], ["moux", mouseX], ["mouy", mouseY], ["ballpos", dotslist[0].l.y],["vec", wallist[0].vec.y])
}

function keyTyped() {
  if (keyCode === 32 && dt == 1) {
    dt = 0;
  } else {
    dt = 1;
  }
}

function textwall(x, y, ...args) {
  push()
  textSize(15)
  for (var a in args) {
    text(args[a][0] + " = " + args[a][1], x, y + a * 15)
  }
  pop()
}

function btwn(x, y, a) {
  if (a >= Math.min(x, y) && a <= Math.max(x, y)) {
    return true
  } else return false
}
