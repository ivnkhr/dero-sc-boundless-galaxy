!function(n,t,e){function o(n){var s,t=this,e=(s=4022871197,function(n){n=n.toString();for(var t=0;t<n.length;t++){var e=.02519603282416938*(s+=n.charCodeAt(t));e-=s=e>>>0,s=(e*=s)>>>0,s+=4294967296*(e-=s)}return 2.3283064365386963e-10*(s>>>0)});t.next=function(){var n=2091639*t.s0+2.3283064365386963e-10*t.c;return t.s0=t.s1,t.s1=t.s2,t.s2=n-(t.c=0|n)},t.c=1,t.s0=e(" "),t.s1=e(" "),t.s2=e(" "),t.s0-=e(n),t.s0<0&&(t.s0+=1),t.s1-=e(n),t.s1<0&&(t.s1+=1),t.s2-=e(n),t.s2<0&&(t.s2+=1),e=null}function u(n,t){return t.c=n.c,t.s0=n.s0,t.s1=n.s1,t.s2=n.s2,t}function s(n,t){var e=new o(n),s=t&&t.state,r=e.next;return r.int32=function(){return 4294967296*e.next()|0},r.double=function(){return r()+11102230246251565e-32*(2097152*r()|0)},r.quick=r,s&&("object"==typeof s&&u(s,e),r.state=function(){return u(e,{})}),r}t&&t.exports?t.exports=s:e&&e.amd?e(function(){return s}):this.alea=s}(0,"object"==typeof module&&module,"function"==typeof define&&define);

var w = window.innerWidth;
var h = window.innerHeight-114;

/*
window.onresize = function () {
  w = ctx.canvas.width = window.innerWidth;
  h = ctx.canvas.height = window.innerHeight;
};*/

//var UNI = Math.random();
//UNI = 'UNI1';

var arng = new alea('UNIVERSE');
var canvas = document.createElement('canvas');

//document.body.appendChild(canvas);
//document.body.style.background = 'url(' + canvas.toDataURL() + ')';


canvas.width = w;
canvas.height = h;

var ctx = canvas.getContext('2d');

mix_Red = 80;
mix_Green = 140;
mix_Blue = 220;
opacity = .15;
smoke_Size = 5;
select = {Compositing: 'lighter'};

var controls = new function() {
  this.mix_Red = mix_Red;
  this.mix_Green = mix_Green;
  this.mix_Blue = mix_Blue;
  this.opacity = opacity;
  this.smoke_Size = smoke_Size;
  
  this.redraw = function() {
    mix_Red = controls.mix_Red;
    mix_Green = controls.mix_Green;
    mix_Blue = controls.mix_Blue;
    opacity = controls.opacity;
    smoke_Size = controls.smoke_Size;
    ctx.globalCompositeOperation = Object.values(select)[0];
  }
}

var obj = { CLEAR_CANVAS:function(){ ctx.clearRect(0,0,w,h); }};

//var gui = new dat.GUI({resizable : false});
/*
gui.add(controls, "mix_Red", 0, 255).step(1).onChange(controls.redraw);
gui.add(controls, "mix_Green", 0, 255).step(1).onChange(controls.redraw);
gui.add(controls, "mix_Blue", 0, 255).step(1).onChange(controls.redraw);
gui.add(controls, "opacity", 0, 1).onChange(controls.redraw);
gui.add(controls, "smoke_Size", 1, 20).onChange(controls.redraw);
gui.add(select, 'Compositing', {
/*Source_Over: "source-over",
  Source_In: "source-in",
  Source_Out: "source-out",
  Source_Atop: "source-atop",
  Destination_Over: "destination-over",
  Destination_In: "destination-in",
  Destination_Out: "destination-out",
  Destination_Atop: "destination-atop",
  Copy: "copy",
  XOR: "xor",
  Screen: "screen",
  Overlay: "overlay",
  Color_Dodge: "color-dodge",
  Color_Burn: "color-burn",
  Hard_Light: "hard-light",
  Soft_Light: "soft-light",
  Difference: "difference",
  Exclusion: "exclusion",
  Hue: "hue",
  Saturation: "saturation",
  Color: "color",
  Luminosity: "luminosity",
  Ligher: 'lighter',
  Darker: 'darker',
  Multiply: 'multiply'
}).onChange(controls.redraw);
gui.add(obj,'CLEAR_CANVAS');
*/

ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, w, h);

ctx.globalCompositeOperation = 'lighter';

var randomNumbers = function randomNumbers(length) {return Array.from(new Array(length), function () {return arng.double();});};
var TAU = Math.PI * 2;

var createSmokeParticle = function createSmokeParticle() {

  var canvas = document.createElement('canvas');

  var w = 100;
  var h = 100;
  var cx = w * 0.5;
  var cy = h * 0.5;

  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  canvas.ctx = ctx;

  var xRand = -5 + arng.double() * 10;
  var yRand = -5 + arng.double() * 10;
  var xRand2 = 10 + arng.double() * (cx / 2);
  var yRand2 = 10 + arng.double() * (cy / 2);

  var color = {
    r: mix_Red,
    g: mix_Green,
    b: mix_Blue
    // r: Math.round(mix_Red + arng.double() * 100),
    // g: Math.round(mix_Green + arng.double() * 100),
    // b: Math.round(mix_Blue + arng.double() * 100)
  };


  ctx.fillStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ','+opacity+')';

  Array.
  from(new Array(200), function () {return randomNumbers(3);}).
  forEach(function (p, i, arr) {
    var length = arr.length;

    var x = Math.cos(TAU / xRand / length * i) * p[2] * xRand2 + cx;
    var y = Math.sin(TAU / yRand / length * i) * p[2] * yRand2 + cy;


    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, p[2] * 4, 0, TAU);
    ctx.fill();
  });

  return canvas;
};

var Particle = function Particle() {
  var p = this;
  p.osc1 = {
    osc: 0,
    val: 0,
    freq: arng.double() };

  p.osc2 = {
    osc: 0,
    val: 0,
    freq: arng.double() };

  p.counter = 0;
  p.x = mousePos.x;
  p.y = mousePos.y;
  p.size = arng.double() * 100;
  p.growth = arng.double() / 20;
  p.life = arng.double();
  p.opacity = arng.double() / 5;
  p.speed = {
    x: arng.double(),
    y: arng.double() };

  p.texture = createSmokeParticle();
  p.rotationOsc = Math.round(arng.double()) ? 'osc1' : 'osc2';
};

var particles = [];

var update = function update() {

  particles.forEach(function (p, i) {

    p.x = mousePos.x;
    p.y = mousePos.y;
    p.size = Math.sqrt(Math.pow(p.x - p.ox, 2) + Math.pow(p.y - p.oy, 2)) * smoke_Size;
    p.counter += 0.01;
    p.growth = Math.sin(p.life);
    p.life -= 0.001;
    p.osc1.osc = Math.sin(p.osc1.val += p.osc1.freq);
    p.osc2.osc = Math.cos(p.osc2.val += p.osc2.freq);
    p.ox = p.x;
    p.oy = p.y;

  });
};

var render = function render() {
  particles.forEach(function (p) {
    ctx.save();

    ctx.globalAlpha = p.opacity / (p.size / 50);
    ctx.translate(p.x, p.y);
    ctx.rotate(arng.double() * TAU);
    ctx.drawImage(p.texture, 0 - p.size / 2, 0 - p.size / 2, p.size, p.size);

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(' + (
    155 + Math.round(arng.double() * 100)) + ',' + (
    155 + Math.round(arng.double() * 100)) + ',' + (
    155 + Math.round(arng.double() * 100)) + ',' +
    arng.double() + ')';

    ctx.arc(arng.double() * p.size, arng.double() * p.size, arng.double(), 0, TAU);
    ctx.fill();

    ctx.restore();

  });

};

var loop = function loop() {
  update();
  render();
  window.requestAnimationFrame(loop);
};

var mousePos = {
  x: 0,
  y: 0 };


var drawingMode = false;
var activateDraw = function activateDraw(e) {
  drawingMode = true;
  particles = Array.from(new Array(10), function () {return new Particle();});
  draw(e);
};
var disableDraw = function disableDraw(e) {
  drawingMode = false;
  particles = [];
};
var draw = function draw(e) {
  // console.log(drawingMode);
  if (!drawingMode) return;
  // console.log(e);
  particles.forEach(function (p) {
    //p.size = Math.max(10,e.movementX + e.movementY);
  });
  

};

canvas.addEventListener('mousedown', activateDraw);
canvas.addEventListener('mousemove', function (e) {
  //mousePos.x = e.layerX;
  //mousePos.y = e.layerY;
  //console.log(mousePos);
  //draw(e);
});
canvas.addEventListener('mouseup', disableDraw);

canvas.addEventListener('touchstart', activateDraw);
canvas.addEventListener('touchmove', function (e) {
  mousePos.x = e.touches[0].clientX;
  mousePos.y = e.touches[0].clientY;
  draw(e);
});
canvas.addEventListener('touchend', disableDraw);

//canvas.addEventListener('touchstart', e => activateDraw);
//canvas.addEventListener('touchmove', e => draw);
//canvas.addEventListener('touchend', e => disableDraw);

loop();

function initBlend(){
	var arngc = new alea(UNI+'Blend');
	mix_Red = 10+arngc.double()*150;
	mix_Green = 10+arngc.double()*150;
	mix_Blue = 10+arngc.double()*150;
	opacity = 0.10;
	smoke_Size = 2;
	ctx.globalCompositeOperation = 'lighter';
	//console.log('Blend', mix_Red);
  var reste = new alea(UNI);
}

function randomBlend(){
	var arngz = new alea(UNI+'Blend'+mix_Red);
	mix_Red = 10+arngz.double()*250;
	mix_Green = 10+arngz.double()*250;
	mix_Blue = 10+arngz.double()*250;
	opacity = 0.10+(arngz.double()*0.8);
	smoke_Size = 2+(arngz.double()*10);
	ctx.globalCompositeOperation = 'lighter';
	//console.log('Blend', mix_Red);
  var reste = new alea(UNI);
}

var timeouts = [];

function drawageManual(x,y,rad,sup){
	var arngx = new alea(UNI+'Blend '+x+' / '+y+' / '+rad+' / '+sup);
	
	etalon = 1080/h;
	base = etalon;
	
	scale_rad = rad/base;
	for(i=0;i<sup;i++){
		timeouts.push(setTimeout(function(){
			
			//console.log('Blend point', mousePos);
			mousePos.x = x-(scale_rad/2)+(arngx.double()*scale_rad*0.9);
			mousePos.y = y-(scale_rad/2)+(arngx.double()*scale_rad*0.9);
			draw();
		},i));
	}
  var reste = new alea(UNI);
}

function cleatTM(){
  try{
    for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
  }catch(err){
    // err
  }
}

function drawRandom(blendTo, uni){
  cleatTM();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
	UNI = uni;
	var arng = new alea(UNI);
	x=8;
	//alert(x);
	downscale = h/1080;
	if(downscale>1.2) downscale = 1.2;
  downscale = 0.8;
	//blendTo.style.background = 'url(' + canvas.toDataURL() + ')';
	initBlend();
	activateDraw();
  opacity = 1;
	drawageManual(w/2,h/2,300,800*downscale);
	setTimeout(function(){
		disableDraw();
		randomBlend();
		activateDraw();
		drawageManual(w/2,h/2,400,100*downscale);
		setTimeout(function(){
			setTimeout(function(){
        var arng = new alea(UNI);
				for(i=0;i<x;i++){
					setTimeout(function(){
						disableDraw();
						randomBlend();
						activateDraw();
						//var arng = new alea(UNI+'Blend '+UNI);
            smoke_Size = 200;
            opacity = 10;
						drawageManual( w*arng.double()  , h*arng.double(),   10, 200*downscale); //1000 = 300 - 
						//blendTo.style.background = 'url(' + canvas.toDataURL() + ')';
					},201*downscale*i);
				}
			},100);
		},101*downscale);
		blendTo.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';
	},801*downscale);
	
	setTimeout(function(){blendTo.style.backgroundImage = 'url(' + canvas.toDataURL() + ')'; },201*downscale*x + 100 + 101*downscale + 801*downscale + 100);
	
}

function drawRandomUni(blendTo, uni){
  cleatTM();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
	UNI = uni;
  console.log(UNI);
	var arngi = new alea(UNI);
	x=6+arngi.double()*6;
	//alert(x);
	//downscale = h/1080;
	//if(downscale>1.2) downscale = 1.2;
	
  downscale = 0.8;
	initBlend();
	activateDraw();
	//drawageManual(w/2,h/2,300,800*downscale);
  //blendTo.style.background = 'url(' + canvas.toDataURL() + ')';
  
	setTimeout(function(){
		disableDraw();
		randomBlend();
		activateDraw();
		drawageManual(w/2,h/2,400,100*downscale);
		setTimeout(function(){
			setTimeout(function(){
        var arngi = new alea(UNI);
				for(i=0;i<x;i++){
					setTimeout(()=>{
						disableDraw();
						randomBlend();
						activateDraw();
						//var arng = new alea(UNI+'Blend '+UNI);
						drawageManual( w/2 - 300 + arngi.double()*600  , h/2 + arngi.double()*100 - 50,   10+arngi.double()*100,300*downscale); //1000 = 300 - 
            
						if (Math.random() < 0.5) blendTo.style.background = 'url(' + canvas.toDataURL() + ')';
            
					},301*downscale*i);
				}
			},100);
		},101*downscale);
		blendTo.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';
	},01*downscale);
	
	setTimeout(function(){blendTo.style.backgroundImage = 'url(' + canvas.toDataURL() + ')'; },401*downscale*x + 100 + 101*downscale + 801*downscale + 100);
	
}
