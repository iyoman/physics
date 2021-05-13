function setup() {
  createCanvas(windowWidth - 5, windowHeight - 5);
  textSize(window.innerHeight / 20)
  curveTightness(0)
  colorMode(HSB, 100)
  new Link({x:30,y:300,size:15,len:100})
}

var dotslist = []
var mainlist = []
var energy = []
var fpms = 10
var dt = 1
var g = 0.8
var mVx = 0
var mVy = 0
var mVel = 0
var mAx = 0
var mAy = 0

class Link {
  constructor({x=50,y=50,vx=0,vy=0,ax=0,ay=0,color=[30,100,100],mass=1,size=1,ox=100,oy=100,len=50,ang=PI/2}) {
    this.l = createVector(x,y)
    this.o = createVector(ox,oy)
    this.v = createVector(vx,vy)
    this.a = createVector(ax,ay)
    this.color = color
    this.mass = mass
    this.size = size
    this.len = len;
    this.theta = ang;
    this.aV = 0.0;
    this.aA = 0.0;
    this.damping = 0.995;
    dotslist.push(this)
    mainlist.push(this)
  }

  run() {
    this.update()
    this.render()
  }

  update() {
    this.aA = ((g*-1 / this.len) * sin(this.theta))+((mAx*-1 / this.len) * cos(this.theta))+((mAy / this.len) * sin(this.theta));
    this.aV += this.aA*dt; // Increment velocity
    this.aV *= this.damping; // Arbitrary damping
    this.theta += this.aV*dt; // Increment angle
    this.l.set(this.len * sin(this.theta), this.len * cos(this.theta), 0);
    this.o.set(mouseX,mouseY)
    this.l.add(this.o);
    this.head = atan2(this.o.x-this.l.x,this.o.y-this.l.y)
  }

  render() {
    push()
    fill(this.color[0],this.color[1],this.color[2])
    ellipse(this.l.x, this.l.y, this.size)
    line(this.o.x,this.o.y,this.l.x,this.l.y)
    
    pop()
  }
}

function draw() {
  background(255);
  energy = []
  mVelocity()
  mainlist.forEach(function(e) {
    e.run()
  })
  if (dt == 0) {
    paused = "Paused"
  } else {
    paused = ""
  }
  text(paused, 20, 65)
  textwall(windowWidth - 150, 20, ["mv",mAx], ["ang",dotslist[0].theta],["head",dotslist[0].head])
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

function appF(force) {
  obj.a.add(force.copy().div(obj.mass))
}

function mVelocity() {
  pmVx = mVx
  pmVy = mVy
  mVx = mouseX-pmouseX
  mVy = mouseY-pmouseY
  mVel = sqrt(mVx*mVx+mVy*mVy)
  mAx = mVx-pmVx
  mAy = mVy-pmVy
}
