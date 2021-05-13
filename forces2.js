function setup() {
  createCanvas(windowWidth - 5, windowHeight - 5);
  textSize(window.innerHeight / 20);
  curveTightness(0);
  colorMode(HSB, 100);
  debug = 1;

  b1 = new Bob({
    x: 200,
    y: 100,
    size: 30,
    link: [],
    ay: 0.0,
    mass: 10,
  });
  b2 = new Bob({
    x: 100,
    y: 100,
    size: 25,
    link: [[b1, 200]],
    mass: 1,
  });
  b3 = new Bob({
    x: 100,
    y: 100,
    size: 20,
    link: [[b2, 50, 1]],
    mass: 1,
  });
  b4 = new Bob({
    x: 200,
    y: 100,
    size: 20,
    link: [
      [b3, 50, 1],
      [b2, 50, 1],
    ],
    mass: 1,
  });
  b5 = new Bob({
    x: 201,
    y: 200,
    size: 20,
    link: [
      [b3, 50, 1],
      [b4, 50, 1],
    ],
    mass: 1,
  });

  mainlist.forEach(function (e) {
    e.initialize();
  });
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
  mAy = 0;

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
    damping = 0.4,
    k = 0.2,
    link = [],
  }) {
    this.l = createVector(x, y);
    this.v = createVector(vx, vy);
    this.a = createVector(ax, ay);
    this.f = createVector(0, 0);
    this.color = color;
    this.mass = mass;
    this.size = size;
    this.k = k;
    this.damping = damping;
    this.links = link;
    dotslist.push(this);
    mainlist.push(this);
  }

  update() {
    this.f.set(0, 0);
    this.vec = createVector(0, 0);
    addA(this.a, this);
    for (var i in this.links) {
      let linky = this.links[i];
      this.vec = linky[0].l.copy().sub(this.l); //vector to linkobj position
      this.vec.setMag(this.vec.mag() - linky[1]).mult(this.k); //mult by spring const
      acomp(this.v.copy().sub(linky[0].v), this.vec);
      let df = c1.mult(this.damping * -1);
      this.f.add(this.vec.add(df));
      drawArrow(this.l, this.vec, "blue", 20);
    }
  }

  finalupdate() {
    this.v.add(this.f.copy().div(this.mass).mult(dt));
    this.l.add(this.v.copy().mult(dt));
  }

  render() {
    push();
    fill(this.color[0], this.color[1], this.color[2]);
    ellipse(this.l.x, this.l.y, this.size);
    drawArrow(this.l, this.f, "green", 50);
    drawArrow(this.l, this.v, "red", 5);

    pop();
  }

  initialize() {
    for (var i in this.links) {
      if (this.links[i][2] == 1) {
        this.links[i][0].links.push([this, this.links[i][1]]);
      }
    }
  }
}

function draw() {
  background(255);
  frameRate(60);
  mVelocity();
  mainlist.forEach(function (e) {
    e.update();
  });
  mainlist.forEach(function (e) {
    e.finalupdate();
    e.render();
  });
  paused();
  textwall(windowWidth - 150, 20, ["mv", mAx]);
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
    text(args[a][0] + ": " + nfs(round(args[a][1], 2)), x, y + a * 15);
  }
  pop();
}

function btwn(x, y, a) {
  if (a >= Math.min(x, y) && a <= Math.max(x, y)) {
    return true;
  } else return false;
}

function addA(acc, obj) {
  obj.f.add(acc.copy().mult(obj.mass));
}

function mVelocity() {
  pmVx = mVx;
  pmVy = mVy;
  mVx = mouseX - pmouseX;
  mVy = mouseY - pmouseY;
  mVel = sqrt(mVx * mVx + mVy * mVy);
  mAx = mVx - pmVx;
  mAy = mVy - pmVy;
}

function acomp(vect, targ) {
  let a = vect.angleBetween(targ);
  if (!isFinite(a)) {
    a = 0;
  }
  c1 = targ.copy().setMag(cos(a) * vect.mag());
  c2 = targ
    .copy()
    .rotate(HALF_PI)
    .setMag(-1 * sin(a) * vect.mag());
}

function paused() {
  if (dt == 0) {
    pause = "Paused";
  } else {
    pause = "";
  }
  text(pause, 20, 65);
}

function drawArrow(base, vec, myColor, scal) {
  if (debug) {
    let scl = scal;
    push();
    strokeWeight(1);
    stroke(myColor);
    fill(myColor);
    translate(base.x, base.y);
    let vec2 = vec.copy().mult(scl);
    line(0, 0, vec2.x, vec2.y);
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec2.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }
}
