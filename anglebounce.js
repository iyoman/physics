function setup() {
  createCanvas(windowWidth - 5, windowHeight - 5);
  textSize(window.innerHeight / 20);
  curveTightness(0);
  colorMode(HSB, 100);
  new Wall(50, 500, 300, 500);
  new Dot(200, 50, 1, 0, 0, 10, 5);
}

var dotslist = [];
var wallist = [];
var mainlist = [];
var energy = [];
var fpms = 10;
var dt = 1;
var g = 0.2;

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
    this.py = this.pl.y;
    this.px = this.pl.x;
    this.m = (this.py - this.y) / (this.px - this.x);
    this.b = this.y - this.m * this.x;
    for (var i = 0; i< wallist.length; i++) {
      let wall = wallist[i];
      if (
        btwn(wall.ab1.x, wall.ab2.x, this.x) &&
        btwn(wall.ab1.y, wall.ab2.y, this.y)
      ) 
      {
        if (isFinite(this.m) == false) {
          //tests for vertical slopes
          this.cx = this.x;
        } else if (isFinite(wall.m) == false) {
          this.cx = wall.ax;
        } else {
          this.cx = (wall.b - this.b) / (this.m - wall.m);
        }
        this.cy = wall.m * this.cx + wall.b;
        if (
          //collision check
          btwn(this.x, this.px, this.cx) &&
          btwn(this.y, this.py, this.cy) &&
          btwn(wall.ax, wall.bx, this.cx) &&
          btwn(wall.ay, wall.by, this.cy)
        ) {
          this.v.reflect(wall.vec.copy().rotate(HALF_PI));
          this.l.add(this.v);
        }
      }
    } //end of for loop
    //end of update
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
    fill("green");
    stroke("green");
    point(this.ab1.x, this.ab1.y);
    point(this.ab2.x, this.ab2.y);
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
    ["Wallm", wallist[0].b],
    ["vel", dotslist[0].v.y],
    ["cy", dotslist[0].cy],
    ["dotm", dotslist[0].m],
    ["moux", mouseX],
    ["mouy", mouseY],
    ["ballpos", dotslist[0].l.y],
    ["ab1", wallist[0].ab1.y]
  );
}

function keyTyped() {
  if (keyCode === 32 && dt == 1) {
    dt = 0;
  } else {
    dt = 1;
  }
}

function textwall(x, y, ...args) {
  push();
  textSize(15);
  for (var a in args) {
    text(args[a][0] + " = " + args[a][1], x, y + a * 15);
  }
  pop();
}

function btwn(bound1, bound2, num) {
  if (num >= Math.min(bound1, bound2) && num <= Math.max(bound1, bound2)) {
    return true;
  } else return false;
}
