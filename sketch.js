function setup() {
  createCanvas(windowWidth, windowHeight);

  let MAX_CLOUDS = 10;

  cs = new CloudSystem(MAX_CLOUDS);

  frameRate(10);

}

function draw() {
  colorMode('hsl')
  background(210, 70, 80);

  cs.show();
  cs.update();

  // uncomment to show framerate
  // stroke(0);
  // text(int(getFrameRate()), 10, windowHeight - 10);

}


class CloudSystem {
  
  constructor(max_clouds) {
    this.len = max_clouds;
    this.clouds = [];        
    for (let i = 0; i < max_clouds; i++) {
      let x = random(width*2);
      let y = random(height);
      let r = random(100, 200);
      this.clouds.push(new Cloud(x, y, r));
    }
  }
  
  update() {
    for (let i = 0; i < this.len; i++) {
      this.clouds[i].move();
      
      if (this.clouds[i].off_screen()) {
        this.clouds.splice(i, 1);
        let x = random(width+100, width*2);
        let y = random(height);
        let r = random(100, 200);
        this.clouds.push(new Cloud(x, y, r));
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

  constructor(x, y, r) {
    let base = new cloudBase(6, r, x, y);
    let baseMutated = mutateMulti(base, 1);
    this.n_layers = random(10, 20);

    this.layers = make_layers(baseMutated, this.n_layers, 5);

  }

  off_screen() {

    let max_x = [];

      for(let i = 0; i < this.n_layers; i++) {
        max_x[i] = max(this.layers[i].x); 
      }
      
    return max(max_x) < 0;
  }

  show() {
    for(let i = 0; i < this.n_layers; i++) {
      this.layers[i].show(100, .1);
    }
  }

  move() {
    for(let i = 0; i < this.n_layers; i++) {
      this.layers[i].move();
    }
  }

}


class cloudLayer {
  constructor(x, y, v) {
    this.x = x;
    this.y = y;
    this.v = v;
    this.b = 255;
    this.a = .1;
  }

  show(bri, alpha) {
    noStroke();
    fill(bri, alpha);
  
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


class cloudBase {
  constructor(points, r, cx, cy) {
    this.x = [];
    this.y = [];
    this.v = [];
    let ry = r * random(0.05, 0.2);
    let angle = 0;
    let increment = TWO_PI / points;

    for(let i = 0; i < points; i++) {
      if(angle > PI) ry = r * 0.5;
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

function mutateShape(shape) {

  new_x = [];
  new_y = [];
  new_v = [];
  n = shape.x.length;

  for(let i = 0; i < n; i++) {
    x = shape.x[i];
    y = shape.y[i];
    v = shape.v[i];
    xend = shape.x[(i+1) % n];
    yend = shape.y[(i+1) % n];

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

  outShape = new cloudLayer(new_x, new_y, new_v);

  return outShape;

}

function mutateMulti(shape, iterations) {

  outShape = shape;
  for(let i = 0; i < iterations; i++) {
    outShape = mutateShape(outShape);
  }

  return outShape;

}


function make_layers(base, n_layers, mutations) {
  let layers = [];
    for(let i = 0; i < n_layers; i++) {
      layers[i] = mutateMulti(base, mutations);
    }

  return layers;

}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
