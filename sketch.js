// randomize radius, layers

function setup() {
  createCanvas(windowWidth, windowHeight);

  cs = new CloudSystem(20);

  frameRate(10);

}

function draw() {
  colorMode('hsl')
  background(210, 70, 80);

  cs.show();
  cs.update();

  // show framerate to check performance
  // stroke(0);
  // text(int(getFrameRate()), 10, windowHeight - 10);

}


class CloudSystem {
  
  constructor(max_clouds) {
    this.len = max_clouds;
    this.clouds = [];        
    for (let i = 0; i < max_clouds; i++) {
      this.clouds.push(new Cloud(random(width*2), random(height)));
    }
  }
  
  update() {
    for (let i = 0; i < this.len; i++) {
      this.clouds[i].move();
      
      if (this.clouds[i].off_screen()) {
        this.clouds.splice(i, 1);
        this.clouds.push(new Cloud(random(width+100, width*2), random(height)));
      }
    }
    
  }
  
  show() {
    for (let i = 0; i < this.len; i++) {
      this.clouds[i].show();
    }
    
  }

}


class Cloud {

  constructor(x, y) {
    let base = new Base(8, height*random(.1, .2), x, y);
    this.baseMutated = mutateMulti(base, 1);
    let prev_xmax = 0;

    this.layers = 20;
    this.clArr = [];

    for(let i = 0; i < this.layers; i++) {
      this.clArr[i] = mutateMulti(this.baseMutated, 4);
      let xmax = max(this.clArr[i].x);

      if(xmax > prev_xmax) {
        prev_xmax = xmax;
        this.maxlayer = i;
      }   
      
    }

  }

  off_screen() {
    return max(this.clArr[this.maxlayer].x) < 0;
  }

  show() {
    for(let i = 0; i < this.layers; i++) {
      this.clArr[i].show(255);
    }
    // this.baseMutated.show(0);
  }

  move() {
    // this.baseMutated.move();
    for(let i = 0; i < this.layers; i++) {
      this.clArr[i].move();
    }
  }

}


class Base {
  constructor(points, r, cx, cy) {
    this.x = [];
    this.y = [];
    this.v = [];
    let ry = r * .1;
    let angle = 0;
    let increment = TWO_PI / points;

    for(let i = 0; i < points; i++) {
      if(angle > PI) ry = r * .5;
      this.x[i] = cos(angle) * r + cx;
      this.y[i] = -sin(angle) * ry + cy;
      this.v[i] = 100 * noise(this.x[i], this.y[i]); //pow(1 + noise(this.x[i], this.y[i]), 7);     
      angle  += increment;
    }

    this.side = sqrt(pow(this.x[1] - this.x[0], 2) + pow(this.y[1] - this.y[0], 2));
  }

  // show() {
  //   // noStroke();
  //   stroke(200);
  //   fill(255);
  
  //   beginShape();
  //   for(let i = 0; i < this.x.length; i++) {
  //     vertex(this.x[i], this.y[i]);
  //   }
  //   endShape(CLOSE);

  //   fill(0);
  //   for(let i = 0; i < this.x.length; i++) {
  //     circle(this.x[i], this.y[i], 10);
  //   }

  // }

}


class baseShape {
  constructor(x, y, v) {
    this.x = x;
    this.y = y;
    this.v = v;
  }

  show(bri) {
    noStroke();
    fill(bri, .1);
  
    beginShape();
    for(let i = 0; i < this.x.length; i++) {
      vertex(this.x[i], this.y[i]);
    }
    endShape(CLOSE);

    // fill(0);
    // for(let i = 0; i < this.x.length; i++) {
    //   circle(this.x[i], this.y[i], 10);
    // }

  }

  move() {
    for(let i = 0; i < this.x.length; i++) {
      this.x[i] -= 1;
    }
  }

}

function mutateShape(s) {

  new_x = [];
  new_y = [];
  new_v = [];
  n = s.x.length;

  for(let i = 0; i < n; i++) {
    x = s.x[i];
    y = s.y[i];
    v = s.v[i];
    xend = s.x[(i+1) % n];
    yend = s.y[(i+1) % n];

    // prop = random();
    side_length = sqrt(pow(x - xend, 2) + pow(y - yend, 2));
    prop = .5;

    angle = atan2(y - yend, x - xend) - HALF_PI + random(-PI, PI);

    xint = x + (xend - x) * prop;
    yint = y + (yend - y) * prop;

    new_side_length = sqrt(pow(x - xint, 2) + pow(y - yint, 2));
    

    dist = v * (new_side_length / side_length) * 1.5;

    xmut = xint + cos(angle) * dist;
    ymut = yint + sin(angle) * dist;


    new_x[i*2] = x;
    new_x[i*2+1] = xmut;
    new_y[i*2] = y;
    new_y[i*2+1] = ymut;
    new_v[i*2] = dist;
    new_v[i*2+1] = dist;
  }

  outShape = new baseShape(new_x, new_y, new_v);

  return outShape;

}

function mutateMulti(inShape, iterations) {

  outShape = inShape;
  for(let i = 0; i < iterations; i++) {
    outShape = mutateShape(outShape);
  }

  return outShape;

}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
