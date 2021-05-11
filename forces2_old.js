function setup() {
  createCanvas(windowWidth - 5, windowHeight - 5);
  textSize(window.innerHeight / 20)
  curveTightness(0)
  colorMode(HSB, 100)
  
  b1 = new Bob({
    x: 200,
    y: 200,
    size: 5,
    ay: 0
  })
  b2 = new Bob({
    x: 201,
    y: 150,
    size: 15,
    link: [
      [b1, 50]
    ],
    ay: 0.2,
    mass: 1
  })
  b3 = new Bob({
    x: 250,
    y: 150,
    size: 15,
    link: [
      [b2, 100, 1],
    ],
    ay: 0.2,
    mass: 1
  })
  b4 = new Bob({
    x: 150,
    y: 100,
    size: 15,
    link: [
      [b3, 100,1],
    ],
    ay: 0.2,
    mass: 1
  })
  
  mainlist.forEach(function(e) {
    e.initialize()
  })
}

var dotslist = [],
  mainlist = [],
  energy = [],
  fpms = 10,
  dt = 1,
  mVx = 0,
  mVy = 0,
  mVel = 0,
  mAx = 0,
  mAy = 0

class Bob {
  constructor({
    x = 50,
    y = 50,
    vx = 0,
    vy = 0,
    ax = 0,
    ay = 0.2,
    color = [30, 100, 100],
    mass = 1,
    size = 1,
    damping = 0.7,
    k = 0.5,
    link = []
  }) {
    this.l = createVector(x, y)
    this.v = createVector(vx, vy)
    this.a = createVector(ax, ay)
    this.f = createVector(0, 0)
    this.color = color
    this.mass = mass
    this.size = size
    this.k = k
    this.damping = damping
    this.links = link
    dotslist.push(this)
    mainlist.push(this)
  }

  run() {
    this.update()
    this.render()
  }

  update() {
    this.f.set(0, 0)
    this.vec = createVector(0, 0)
    addA(this.a, this)
    for (var i in this.links) {
      this.vec = this.links[i][0].l.copy().sub(this.l)
      this.vec.setMag(this.vec.mag() - this.links[i][1]).mult(this.k)
      acomp(this.v, this.vec)
      let df = c1.mult(this.damping * -1)
      this.f.add(this.vec.add(df))
      line(this.l.x, this.l.y, this.l.x + this.vec.x, this.l.y + this.vec.y)
      //as = f / M;         
      //vs = D * (vs + as);  
      //ps = ps + vs;  
    }
    this.v.add(this.f.div(this.mass))
    this.l.add(this.v)
  }

  render() {
    push()
    fill(this.color[0], this.color[1], this.color[2])
    ellipse(this.l.x, this.l.y, this.size)
    pop()
  }
  
  initialize() {
    for (var i in this.links) {
      if (this.links[i][2] == 1) {
        this.links[i][0].links.push([this,this.links[i][1]])
      }
    }
    console.log(this.links)
  }
  
}

function draw() {
  background(255);
  mVelocity()
  mainlist.forEach(function(e) {
    e.run()
  })
  paused()
  textwall(windowWidth - 150, 20, ["mv", mAx], ["vy", dotslist[1].v.y], ["vx", dotslist[1].v.x])
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
    text(args[a][0] + ": " + nfs(round(args[a][1], 2)), x, y + a * 15)
  }
  pop()
}

function btwn(x, y, a) {
  if (a >= Math.min(x, y) && a <= Math.max(x, y)) {
    return true
  } else return false
}

function addA(acc, obj) {
  obj.f.add(acc.copy().mult(obj.mass))
}

function mVelocity() {
  pmVx = mVx
  pmVy = mVy
  mVx = mouseX - pmouseX
  mVy = mouseY - pmouseY
  mVel = sqrt(mVx * mVx + mVy * mVy)
  mAx = mVx - pmVx
  mAy = mVy - pmVy
}

function acomp(vect, targ) {
  let a = vect.angleBetween(targ)
  if (!isFinite(a)) {
    a = 0
  }
  c1 = targ.copy().setMag(cos(a) * vect.mag())
  c2 = targ.copy().rotate(HALF_PI).setMag(-1 * sin(a) * vect.mag())
}

function paused() {
  if (dt == 0) {
    pause = "Paused"
  } else {
    pause = ""
  }
  text(pause, 20, 65)
}
