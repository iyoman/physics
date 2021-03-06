function setup() {
  createCanvas(windowWidth - 5, windowHeight - 5);
  textSize(window.innerHeight / 20);
  curveTightness(0);
  colorMode(HSB, 100);
  debug = 1;

  b1 = new Bob({
    x: 200,
    y: 100,
    vx: 0,
    size: 30,
    link: [],
    ay: 0.1,
    mass: 1,
  });
  b2 = new Bob({
    x: 100,
    y: 100,
    vx: 0,
    size: 25,
    link: [],
    mass: 1,
    ay: 0,
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
  mAy = 0,
  down = 0,
  dot1 = 0,
  dot2 = 0,
  wallist = [];

class Bob {
  constructor({
    x = 50,
    y = 50,
    vx = 0,
    vy = 0,
    ax = 0,
    ay = 0.1,
    color = [30, 100, 100],
    mass = 1,
    size = 1,
    damping = 0.1,
    k = 0.01,
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
    this.pl = this.l.copy();
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
    collide(this);
    collide(this);
    this.nocol = 0
  }

  render() {
    push();
    
    fill(this.color[0], this.color[1], this.color[2]);
    ellipse(this.l.x, this.l.y, this.size);
    drawArrow(this.l, this.f, "green", 50);
    drawArrow(this.l, this.v, "red", 5);
    for (var i = 0; i< this.links.length; i++) {
      drawArrow(this.l, this.links[i][0].l.copy().sub(this.l), 'orange', 0.5)
    }
    
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
  finalupdate() {}
  
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
  textwall(windowWidth - 150, 20, ["mv", mAx], ["vx", dotslist[1].v.x]);
  if (keyIsDown(UP_ARROW)) {
    dotslist[0].l.y += 20
    }
  if (keyIsDown(DOWN_ARROW)) {
    dotslist[0].l.y -= 20
    }
  if (keyIsDown(RIGHT_ARROW)) {
    dotslist[0].l.x += 20
    }
  if (keyIsDown(LEFT_ARROW)) {
    dotslist[0].l.x -= 20
    }
  if (keyIsDown(65)) {
    dotslist[0].v.y = 0
    dotslist[0].v.x = 0
    }
  
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
      stroke(40,20,100,80)
      strokeWeight(5)
      line(x1,y1,mouseX,mouseY)
      pop();
    } else if (down == 1) {
      new Wall(x1, y1, mouseX, mouseY);
      down = 0;
    }
  
}//draw

  var dot1 = 0
  var dot2 = 0
  function mouseClicked() {
    for (var i = 0; i<dotslist.length; i++) {
    dot = dotslist[i]
    if (dot.l.copy().sub(mouseX,mouseY).magSq() < dot.size*dot.size/2) {
      if (dot1 == 0) {
        dot1 = dot
      } else {
        dot2 = dot
      }
      }
    }
    if (dot1 != 0 && dot2 != 0) {
      let dist = dot1.l.copy().sub(mouseX,mouseY).mag()
      dot1.links.push([dot2,dist])
      dot2.links.push([dot1,dist])
      dot1 = 0
      dot2 = 0
    } else if (dot1 == 0 && dot2 == 0) {
      new Bob({x:mouseX,y:mouseY,size:50})
    }
    
    
  }//mouseClicked
  

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
