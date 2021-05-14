function setup() {
  createCanvas(windowWidth - 5, windowHeight - 5);
  textSize(window.innerHeight / 20);
  curveTightness(0);
  colorMode(HSB, 100);
  new Wall(0,500,800,500) 
  new Wall(0,503,800,503)
}

var dotslist = [];
var wallist = [];
var mainlist = [];
var energy = [];
var fpms = 10;
var dt = 1;
var g = 0.2;
var down = 0;
var active = 0;

class Dot {
  constructor(x, y, mass, xsp, ysp, color, size) {
    this.x = x;
    this.y = y;
    this.xsp = xsp;
    this.ysp = ysp;
    this.l = createVector(x, y);
    this.v = createVector(xsp, ysp);
    this.color = color;
    this.mass = mass;
    this.size = size;
    dotslist.push(this);
    mainlist.push(this);
  }

  run() {
    this.update();
    this.render();
  }

  update() {
    this.pl = this.l.copy();
    this.pv = this.v.copy();
    this.v.add(0, g * dt);
    this.l.add(this.v.x * dt, this.v.y * dt);
    this.x = this.l.x;
    this.y = this.l.y;
    if (this.y > 1000) {
      let index = mainlist.indexOf(this);
      mainlist.splice(index, 1);
    }
    collide(this);
    collide(this);
    this.nocol = 0
  }

  render() {
    push();
    fill(this.color);
    ellipse(this.l.x, this.l.y, this.size);
    pop();
  }
}

class Wall {
  constructor(ax, ay, bx, by, ...args) {
    this.ax = ax;
    this.ay = ay;
    this.bx = bx;
    this.by = by;
    this.m = (by - ay) / (bx - ax);
    this.b = ay - this.m * ax;
    this.vec = createVector(bx - ax, by - ay);
    let abw = 20;
    this.ab1 = createVector(min(ax, bx) - abw, min(ay, by) - abw);
    this.ab2 = createVector(max(ax, bx) + abw, max(ay, by) + abw);
    this.damping = 0.9;
    wallist.push(this);
    mainlist.push(this);
  }

  run() {
    this.update();
    this.render();
  }

  update() {}

  render() {
    push();
    stroke(60, 100, 70);
    strokeWeight(5);
    line(this.ax, this.ay, this.bx, this.by);
    pop();
  }
}

function draw() {
  background(255);
  energy = [];
  mainlist.forEach(function (e) {
    e.run();
  });
  if (dt == 0) {
    paused = "Paused";
  } else {
    paused = "";
  }
  text(paused, 20, 65);
  textwall(
    windowWidth - 150,
    20,
    ["active", active],
    ["moux", mouseX],
    ["mouy", mouseY],
    ["len", mainlist.length]
  );
  //mouse sensing
  if (active == 1) {
    if (mouseIsPressed && keyIsDown(16)) {
      if (down == 0) {
        x1 = mouseX;
        y1 = mouseY;
      }
      down = 1;
      push();
      fill(40);
      stroke(67, 20, 100, 50);
      strokeWeight(50);
      line(x1, y1, mouseX, mouseY);
      pop();
    } else if (down == 1) {
      new Wall(x1, y1, mouseX, mouseY);
      down = 0;
    } else if (mouseIsPressed) {
      new Dot(mouseX, mouseY, 1, 0, 0, 0, 5);
    }
  }
} //end of draw loop

function keyTyped() {
  if (keyCode === 32 && dt == 1) {
    dt = 0;
  } else {
    dt = 1;
  }
}

function mouseClicked() {
  active = 1;
}

function textwall(x, y, ...args) {
  push();
  textSize(15);
  for (var a in args) {
    text(args[a][0] + ": " + nfs(round(args[a][1], 2)), x, y + a * 15);
  }
  pop();
}

function btwn(bound1, bound2, num) {
  if (num >= Math.min(bound1, bound2) && num <= Math.max(bound1, bound2)) {
    return true;
  } else return false;
}

function collide(obj) {
  obj.py = obj.pl.y;
  obj.px = obj.pl.x;
  obj.x = obj.l.x;
  obj.y = obj.l.y;
  let clist = []
  for (var i = 0; i < wallist.length; i++) {
    let wall = wallist[i];
    if (wall !== obj.nocol) {
      if (
        btwn(wall.ab1.x, wall.ab2.x, obj.x) &&
        btwn(wall.ab1.y, wall.ab2.y, obj.y)
      ) {
        obj.m = (obj.py - obj.y) / (obj.px - obj.x);
        obj.b = obj.y - obj.m * obj.x;
        if (isFinite(obj.m) == false) {
          //tests for vertical slopes
          obj.cx = obj.x;
        } else if (isFinite(wall.m) == false) {
          obj.cx = wall.ax;
        } else {
          obj.cx = (wall.b - obj.b) / (obj.m - wall.m);
        }
        obj.cy = wall.m * obj.cx + wall.b;
        if (
          //collision check
          btwn(obj.x, obj.px, obj.cx) &&
          btwn(obj.y, obj.py, obj.cy) &&
          btwn(wall.ax, wall.bx, obj.cx) &&
          btwn(wall.ay, wall.by, obj.cy)
        ) {
          clist.push({x:obj.cx,y:obj.cy,w:wall})
        }
      }
    }
  }
  let wally = 0
  if (clist.length > 0) { wally = mindist(obj.l, clist);}
  if (wally != 0) { 
  obj.l = obj.pl.copy()
  obj.pl = obj.l.copy();
  obj.v.reflect(wally.vec.copy().rotate(HALF_PI));
  obj.l.add(obj.v);
  obj.v.mult(wally.damping);
  obj.nocol = wally;
  }
}

function mindist(pos, list) {
  let distlist = [];
  for (var i = 0; i < list.length; i++) {
    distlist.push(pos.copy().sub(list[i].x, list[i].y).magSq());
  }
  let index = distlist.indexOf(min(distlist));
  return list[index].w;
}
