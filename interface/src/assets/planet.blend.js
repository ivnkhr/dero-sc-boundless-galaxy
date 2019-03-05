var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
 
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function resize(canvas) {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;
 
  // Check if the canvas is not the same size.
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {
 
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
    
    //canvas.width  = 60;
    //canvas.height = 60;
    
    //console.log('after resize', canvas);
  }
}

function initPlanet(ctx,wh,setoff){

  var setoff = setoff;

  var canvas = document.getElementById(ctx);
  console.log('Find canvas context', canvas);
  //canvas.width=wh;
  //canvas.height=wh;
  //canvas.width=80;
  //canvas.width=wh;
  var structs = {};
  var slots = {};

  var gl = canvas.getContext("webgl");
  var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
  var fragmentShaderSource = document.getElementById("planet-shader").text;
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  var program = createProgram(gl, vertexShader, fragmentShader);
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  var uCities = gl.getUniformLocation(program, "cities");
  var uTime = gl.getUniformLocation(program, "time");
  var uLeft = gl.getUniformLocation(program, "left");
  var uTop = gl.getUniformLocation(program, "top");
  var uResolution = gl.getUniformLocation(program, "resolution");
  var uAngle = gl.getUniformLocation(program, "angle");
  var uRotspeed = gl.getUniformLocation(program, "rotspeed");
  var uLight = gl.getUniformLocation(program, "light");
  var uZLight = gl.getUniformLocation(program, "zLight");
  var uLightColor = gl.getUniformLocation(program, "lightColor");
  var uModValue = gl.getUniformLocation(program, "modValue");
  var uNoiseOffset = gl.getUniformLocation(program, "noiseOffset");
  var uNoiseScale = gl.getUniformLocation(program, "noiseScale");
  var uNoiseScale2 = gl.getUniformLocation(program, "noiseScale2");
  var uNoiseScale3 = gl.getUniformLocation(program, "noiseScale3");
  var uCloudNoise = gl.getUniformLocation(program, "cloudNoise");
  var uCloudiness = gl.getUniformLocation(program, "cloudiness");
  var uOcean = gl.getUniformLocation(program, "ocean");
  var uIce = gl.getUniformLocation(program, "ice");
  var uCold = gl.getUniformLocation(program, "cold");
  var uTemperate = gl.getUniformLocation(program, "temperate");
  var uWarm = gl.getUniformLocation(program, "warm");
  var uHot = gl.getUniformLocation(program, "hot");
  var uSpeckle = gl.getUniformLocation(program, "speckle");
  var uClouds = gl.getUniformLocation(program, "clouds");
  var uWaterLevel = gl.getUniformLocation(program, "waterLevel");
  var uRivers = gl.getUniformLocation(program, "rivers");
  var uTemperature = gl.getUniformLocation(program, "temperature");
  var uHaze = gl.getUniformLocation(program, "haze");

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // three 2d points
  var positions = [
    -1, -1,
    -1, 1,
    1, 1,
    -1, -1,
    1, 1,
    1, -1
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  var vWaterLevel = 0;
  var vRivers = 0;
  var vTemperature = 0;
  var vCold = [0.5, 0.5, 0.5];
  var vOcean = [0.5, 0.5, 0.5];
  var vTemperate = [0.5, 0.5, 0.5];
  var vWarm = [0.5, 0.5, 0.5];
  var vHot = [0.5, 0.5, 0.5];
  var vSpeckle = [0.5, 0.5, 0.5];
  var vClouds = [0.9, 0.9, 0.9];
  var vCloudiness = 0.35;
  var vLightColor = [1.0, 1.0, 1.0];
  var vHaze = [0.15, 0.15, 0.2];

  var vAngle = 0.3;
  var vRotspeed = 0.01;
  var vLight = 1.9;
  var vZLight = 0.5;
  var vModValue = 29;
  var vNoiseOffset = [0, 0];
  var vNoiseScale = [11, 8];
  var vNoiseScale2 = [200, 200];
  var vNoiseScale3 = [50, 50];
  var vCloudNoise = [6, 30];

  function renderPlanet() {
      resize(gl.canvas);
  	//canvas.width  = 3;
  	//canvas.height  = 300;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Clear the canvas
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      // Tell it to use our program (pair of shaders)
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionAttributeLocation);
      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
       
      // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
          positionAttributeLocation, size, type, normalize, stride, offset)

      gl.uniform1i(uCities, 0);
      gl.uniform1f(uTime, t * 0.001); // qqDPS
      gl.uniform1f(uLeft, -(wh/10)/2);
      gl.uniform1f(uTop, -(wh/10)/2);
      gl.uniform2f(uResolution, wh - (wh/10), wh - (wh/10)); //400 / 40
      gl.uniform1f(uAngle, vAngle);
      gl.uniform1f(uRotspeed, vRotspeed);
      gl.uniform1f(uLight, vLight);
      gl.uniform1f(uZLight, vZLight);
      gl.uniform3fv(uLightColor, vLightColor);
      gl.uniform1f(uModValue, vModValue);
      gl.uniform2fv(uNoiseOffset, vNoiseOffset);
      gl.uniform2fv(uNoiseScale, vNoiseScale);
      gl.uniform2fv(uNoiseScale2, vNoiseScale2);
      gl.uniform2fv(uNoiseScale3, vNoiseScale3);
      gl.uniform2fv(uCloudNoise, vCloudNoise);
      gl.uniform1f(uCloudiness, vCloudiness);
      gl.uniform3fv(uOcean, vOcean);
      gl.uniform3f(uIce, 250/255.0, 250/255.0, 250/255.0);
      gl.uniform3fv(uCold, vCold);//53/255.0, 102/255.0, 100/255.0);
      gl.uniform3fv(uTemperate, vTemperate);//79/255.0, 109/255.0, 68/255.0);
      gl.uniform3fv(uWarm, vWarm);//119/255.0, 141/255.0, 82/255.0);
      gl.uniform3fv(uHot, vHot);//223/255.0, 193/255.0, 148/255.0);
      gl.uniform3fv(uSpeckle, vSpeckle);
      gl.uniform3fv(uClouds, vClouds);
      gl.uniform3fv(uHaze, vHaze);
      gl.uniform1f(uWaterLevel, vWaterLevel);
      gl.uniform1f(uRivers, vRivers);
      gl.uniform1f(uTemperature, vTemperature);

      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      gl.drawArrays(primitiveType, offset, count);
  }

  //renderPlanet();

  
  var t = new Date().getTime() % 1000000;

  function nextFrame() {
      t = new Date().getTime() % 1000000;
      renderPlanet();
      requestAnimationFrame(nextFrame);
  }

  // Once everything is set up, start game loop.
  //requestAnimationFrame(nextFrame);

  function doManualBuild(setoff){

  	/*
  	
  		common 		- 0 1 2
  		rare 		- 3 4 5
  		legendary 	- 6 7 8
  		epic 		- 9 10 11
  	
  	*/

  	//SET
  	RARECloudiness = setoff.RARECloudiness;
  	RARECold = setoff.RARECold;
  	RAREOcean = setoff.RAREOcean;
  	RARETemperate = setoff.RARETemperate;
  	RAREWarm = setoff.RAREWarm;
  	RAREHot = setoff.RAREHot;
  	RARESpeckle = setoff.RARESpeckle;
  	RAREClouds = setoff.RAREClouds;
  	RARELightColor = setoff.RARELightColor;
  	//RAREHaze = setoff.RAREHaze;
  	//RARERadiation = 0;
  	
  	
  	//RANDOMS
    /*
  	chance_scale = 1;
  	RARECloudiness = Math.round(Math.random()/chance_scale);
  	RARECold = Math.round(Math.random()/chance_scale);
  	RAREOcean = Math.round(Math.random()/chance_scale);
  	RARETemperate = Math.round(Math.random()/chance_scale);
  	RAREWarm = Math.round(Math.random()/chance_scale);
  	RAREHot = Math.round(Math.random()/chance_scale);
  	RARESpeckle = Math.round(Math.random()/chance_scale);
  	RAREClouds = Math.round(Math.random()/chance_scale);
  	RARELightColor = Math.round(Math.random()/chance_scale);
  	RAREHaze = Math.round(Math.random()/chance_scale);
  	RARERadiation = Math.round(Math.random()/chance_scale);
    */
    
  	/*
  	RARECloudiness = 1;
  	RARECold = 0;
  	RAREOcean = 0;
  	RARETemperate = 0;
  	RAREWarm = 0;
  	RAREHot = 0;
  	RARESpeckle = 0;
  	RAREClouds = 0;
  	RARELightColor = 0;
  	RAREHaze = 0;
  	RARERadiation = 0;
  	*/
  	
  	//logs
    
  	console.log(
  		RARECloudiness,
  		RARECold,
  		RAREOcean,
  		RARETemperate,
  		RAREWarm,
  		RAREHot,
  		RARESpeckle,
  		RAREClouds,
  		RARELightColor,
  	);

  	sum = RARECloudiness + RARECold + RAREOcean + RARETemperate + RAREWarm + RAREHot + RARESpeckle + RAREClouds + RARELightColor;
  	
  	//console.log('common');
  	
  	if(sum>=9){
  		//console.log('!!!EPIC');
  		RAREHaze = 1;
  	}else{
      RAREHaze = 0;
    }
  		
  	if(sum>=5)
  		//console.log('!!legendary');
  		
  	if(sum>=3)
  		//console.log('!rare');

    console.log('inset', setoff);

  	range = setoff.vWaterLevel; // -2;2 (0-4)
  	vWaterLevel = (range-20)/10;
  	
  	range = setoff.vRivers; // (0-1)
  	vRivers = range/100;
  	
  	range = setoff.vTemperature; // -2;2 (0-4)
  	vTemperature = (range-20)/10;
  	
  	range = setoff.vCloudiness; // (0-4)
  	vCloudiness = Math.min(1.5, Math.max(0, range/10));
  	
  	if ( RARECloudiness >= 1 ){
  		vCloudiness = -1;
  	}
  	
  	r = 0+setoff.vCold_r/5 || 10+Math.random()*25;
  	g = 0+setoff.vCold_g/5 || 10+Math.random()*25;
  	b = 0+setoff.vCold_b/5 || 10+Math.random()*25;
  	vCold = [r/100, g/100, b/100]; // haze_r = 25 haze_g = 25 haze_b = 25
  	
  	if ( RARECold >= 1 ){
  		vCold[0] *= 2.5;
  		vCold[1] *= 2.5;
  		vCold[2] *= 2.5;
  	}
  	
  	r = 0+setoff.vOcean_r/5 || 10+Math.random()*25;
  	g = 0+setoff.vOcean_g/5 || 10+Math.random()*25;
  	b = 0+setoff.vOcean_b/5 || 10+Math.random()*25;
  	vOcean = [r/100, g/100, b/100]; // haze_r = 25 haze_g = 25 haze_b = 25
  	
  	if ( RAREOcean >= 1 ){
  		vOcean[0] *= 2.5;
  		vOcean[1] *= 2.5;
  		vOcean[2] *= 2.5;
  	}
  	
  	r = 0+setoff.vTemperate_r/5 || 10+Math.random()*25;
  	g = 0+setoff.vTemperate_g/5 || 10+Math.random()*25;
  	b = 0+setoff.vTemperate_b/5 || 10+Math.random()*25;
  	vTemperate = [r/100, g/100, b/100]; // haze_r = 25 haze_g = 25 haze_b = 25
  	
  	if ( RARETemperate >= 1 ){
  		vTemperate[0] *= 2.5;
  		vTemperate[1] *= 2.5;
  		vTemperate[2] *= 2.5;
  	}
  	
  	r = 0+setoff.vWarm_r/5;
  	g = 0+setoff.vWarm_g/5;
  	b = 0+setoff.vWarm_b/5;
    //r = 0; g = 0; b = 0;
  	vWarm = [r/100, g/100, b/100]; // haze_r = 25 haze_g = 25 haze_b = 25
  	
  	if ( RAREWarm >= 1 ){
  		vWarm[0] *= 2.5;
  		vWarm[1] *= 2.5;
  		vWarm[2] *= 2.5;
  	}
  	
  	r = 0+setoff.vHot_r/5;
  	g = 0+setoff.vHot_g/5;
  	b = 0+setoff.vHot_b/5;
    //r = 0; g = 0; b = 0;
  	vHot = [r/100, g/100, b/100]; // haze_r = 25 haze_g = 25 haze_b = 25
  	
  	if ( RAREHot >= 1 ){
  		vHot[0] *= 2.5;
  		vHot[1] *= 2.5;
  		vHot[2] *= 2.5;
  	}
  	
  	r = 0+setoff.vSpeckle_r/5;
  	g = 0+setoff.vSpeckle_g/5;
  	b = 0+setoff.vSpeckle_b/5;
    //r = 0; g = 0; b = 0;
  	vSpeckle = [r/100, g/100, b/100]; // haze_r = 25 haze_g = 25 haze_b = 25
  	
  	if ( RARESpeckle >= 1 ){
  		vSpeckle[0] *= 2.5;
  		vSpeckle[1] *= 2.5;
  		vSpeckle[2] *= 2.5;
  	}
  	
  	r = 0+setoff.vClouds_r/5;
  	g = 0+setoff.vClouds_g/5;
  	b = 0+setoff.vClouds_b/5;
    // r = 0; g = 0; b = 0;
  	vClouds = [r/100, g/100, b/100]; // haze_r = 25 haze_g = 25 haze_b = 25
  	
  	if ( RAREClouds >= 1 ){
  		vClouds[0] *= 2.5;
  		vClouds[1] *= 2.5;
  		vClouds[2] *= 2.5;
  	}
  	
  	r = 20+0+setoff.vLightColor_r/5;
  	g = 20+0+setoff.vLightColor_g/5;
  	b = 20+0+setoff.vLightColor_b/54;
    // r = 0; g = 0; b = 0;
  	vLightColor = [r/100, g/100, b/100]; // haze_r = 25 haze_g = 25 haze_b = 25
  	
  	if ( RARELightColor >= 1 ){
  		vLightColor[0] *= 2.5;
  		vLightColor[1] *= 2.5;
  		vLightColor[2] *= 2.5;
  	}
  	
  	r = 0+0+setoff.vHaze_r/6;
  	g = 0+0+setoff.vHaze_g/6;
  	b = 0+0+setoff.vHaze_b/6;
    // r = 0; g = 0; b = 0;
  	vHaze = [r/100, g/100, b/100]; // haze_r = 25 haze_g = 25 haze_b = 25
  	
  	if ( RAREHaze >= 1 ){
  		vHaze[0] += 0.2;
  		vHaze[1] += 0.2;
  		vHaze[2] += 0.2;
  		vHaze[0] *= 2.5;
  		vHaze[1] *= 2.5;
  		vHaze[2] *= 2.5;
  	}

  	
  	range = setoff.vAngle;
  	vAngle = ((range)-30)/100;   // range = [0,60] ((range)-30)/100
  	
    //console.log('vAngle', setoff.vAngle, vAngle);
    
  	range = setoff.vRotspeed;
  	vRotspeed = ((range)-10)/100; // range = [0,20] ((range)-10)/100
  	if(vRotspeed<0.01&&vRotspeed>-0.01) vRotspeed = 0.01;
  	
  	vLight = -12;
  	vZLight = -0.2;
  	
  	if(sum>=7){
  		vLight = -12;
  		vZLight = 0.8;
  	}
  		
  	if(sum>=5){
  		vLight = -12;
  		vZLight = 0.4;
  	}
  	
  	if(sum>=3){
  		vLight = -12;
  		vZLight = 0.2;
  	}
  	
  	range = setoff.fixtures01; // 0-20
  	vModValue = 17 + Math.ceil(range);
  	
  	range = setoff.fixtures02; // 0-100
  	range1 = setoff.fixtures03; // 0-100
      vNoiseOffset = [Math.ceil(range), Math.ceil(range1)];
  	
  	range = setoff.fixtures04; // 0-10
  	range1 = setoff.fixtures05; // 0-7
      vNoiseScale = [7 + Math.ceil(range), 5 + Math.ceil(range1)];
  	
  	range = setoff.fixtures06; // 0-220
      sc = 80 + Math.ceil(range);
      vNoiseScale2 = [sc, sc];
  	
  	range = setoff.fixtures07; // 0-80
      sc = 20 + Math.ceil(range);
      vNoiseScale3 = [sc, sc];
  	
  	range = setoff.fixtures08; // 0-9
  	range1 = setoff.fixtures09; // 0-20
      vCloudNoise = [4 + Math.ceil(range), 20 + Math.ceil(range1)];
  	
    //console.log(ctx,wh,setoff);
    
    //return 333;
    
  }

  //renderPlanet();
  
  doManualBuild(setoff);
  requestAnimationFrame(nextFrame);
  //renderPlanet();
  //return canvas;

}