let MAX_CLOUDS = 15;
let MIN_RADIUS = 60;
let MAX_RADIUS = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(20);

  cs = new CloudSystem(MAX_CLOUDS);

}

function draw() {
  colorMode('hsl')
  background(210, 70, 80);

  cs.show();
  cs.update();

  // uncomment to show framerate
  stroke(0);
  text(int(getFrameRate()), 10, windowHeight - 10);

}


class CloudSystem {

  constructor(max_clouds) {
    this.len = max_clouds;
    this.clouds = [];
    for (let i = 0; i < max_clouds; i++) {

      let position = random_position_intial();
      let radius = random(MIN_RADIUS, MAX_RADIUS);
      this.clouds.push(new Cloud(position, radius));
    }
  }

  update() {
    for (let [index, cloud] of this.clouds.entries()) {
      cloud.move();

      if (cloud.out_of_view()) {
        this.clouds.splice(index, 1);
        let position = random_position();
        let radius = random(MIN_RADIUS, MAX_RADIUS);
        this.clouds.push(new Cloud(position, radius));
      }
    }
  }

  show() {
    for (const cloud of this.clouds) {
      cloud.show();
    }
  }

}


class Cloud {

  constructor(position, radius) {
    this.position = position;
    let base = new CloudBase(8, radius);
    let baseMutated = mutate_multi(base, 3);
    this.n_layers = random(20, 40);

    this.layers = make_layers(baseMutated, this.n_layers, 4);

    // Create a graphics buffer the same size as the cloud
    this.buffer = createGraphics(radius * 8, radius * 8);

    // Draw the cloud onto the buffer
    this.buffer.push();
    this.buffer.translate(this.buffer.width / 2, this.buffer.height / 2); // Translate to the center of the buffer

    for (const layer of this.layers) {
      layer.show(this.buffer);  // Note: You'll need to modify your show() method to take a p5.Renderer as an argument
    }
    this.buffer.pop();
  }

  out_of_view() {
    return this.position.x < (-MAX_RADIUS * 1.5);
  }

  show() {
    // Draw the buffer to the screen, rather than re-drawing the entire cloud
    image(this.buffer, this.position.x - this.buffer.width / 2, this.position.y - this.buffer.height / 2);
  }

  move() {
    this.position.x -= 1;
  }

}


class CloudLayer {
  constructor(x, y, v) {
    this.x = x;
    this.y = y;
    this.v = v;
  }

  show(p) {
    p.colorMode('hsl');
    p.noStroke();
    p.fill(100, .05);
  
    p.beginShape();
    for(let i = 0; i < this.x.length; i++) {
      p.vertex(this.x[i], this.y[i]);
    }
    p.endShape(p.CLOSE);
}

}


class CloudBase {
  constructor(points, r) {
    this.x = [];
    this.y = [];
    this.v = [];
    let ry = r * random(0.05, 0.5);
    let angle = 0;
    let increment = TWO_PI / points;

    for (let i = 0; i < points; i++) {
      if (angle > PI) ry = r * 0.5;
      this.x[i] = cos(angle) * r;
      this.y[i] = sin(angle) * ry;
      this.v[i] = pow(1 + noise(this.x[i], this.y[i]), 9); //100 * noise(this.x[i], this.y[i]); //pow(1 + noise(this.x[i], this.y[i]), 7);     
      angle += increment;
    }

    this.side = sqrt(pow(this.x[1] - this.x[0], 2) + pow(this.y[1] - this.y[0], 2));
  }

}

function mutate_shape(shape) {

  new_x = [];
  new_y = [];
  new_v = [];
  n = shape.x.length;

  for (let i = 0; i < n; i++) {
    x = shape.x[i];
    y = shape.y[i];
    v = shape.v[i];
    xend = shape.x[(i + 1) % n];
    yend = shape.y[(i + 1) % n];

    side_length = sqrt(pow(x - xend, 2) + pow(y - yend, 2));
    prop = .5;

    angle = atan2(y - yend, x - xend) - HALF_PI + random(-PI, PI);

    xint = x + (xend - x) * prop;
    yint = y + (yend - y) * prop;

    new_side_length = sqrt(pow(x - xint, 2) + pow(y - yint, 2));


    dist = v * (new_side_length / side_length) * 1.5;

    xmut = xint + cos(angle) * dist;
    ymut = yint + sin(angle) * dist;


    new_x[i * 2] = x;
    new_x[i * 2 + 1] = xmut;
    new_y[i * 2] = y;
    new_y[i * 2 + 1] = ymut;
    new_v[i * 2] = dist;
    new_v[i * 2 + 1] = dist;
  }

  outShape = new CloudLayer(new_x, new_y, new_v);

  return outShape;

}

function mutate_multi(shape, iterations) {

  outShape = shape;
  for (let i = 0; i < iterations; i++) {
    outShape = mutate_shape(outShape);
  }

  return outShape;

}


function make_layers(base, n_layers, mutations) {
  let layers = [];
  for (let i = 0; i < n_layers; i++) {
    layers[i] = mutate_multi(base, mutations);
  }

  return layers;
}


function random_position_intial() {
  return createVector(random(width * 2), random(height));
}

function random_position() {
  return createVector(random(width + MAX_RADIUS, width * 2), random(height));
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
