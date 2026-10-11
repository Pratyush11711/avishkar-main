// Image distortion: expanding waves change the image sampling coordinates.
(() => {
 const media=document.querySelector('.production-media'),image=media.querySelector('img'),canvas=media.querySelector('canvas');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
 if(!gl)return;
 let ready=false,frame=0,lastEmit=0,lastPoint=null;
 const waves=[];
 function shader(type,source){const result=gl.createShader(type);gl.shaderSource(result,source);gl.compileShader(result);if(!gl.getShaderParameter(result,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(result));return result;}
 try{
 const vertex=shader(gl.VERTEX_SHADER,'attribute vec2 position; varying vec2 uv; void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }');
 const fragment=shader(gl.FRAGMENT_SHADER,
  'precision mediump float; varying vec2 uv; uniform sampler2D picture; uniform float now; uniform float aspect; uniform vec4 waves[6];'+
  'void main(){vec2 offset=vec2(0.);for(int i=0;i<6;i++){vec4 wave=waves[i];float age=now-wave.z;if(wave.w>.5&&age>=0.&&age<2.4){vec2 delta=(uv-wave.xy)*vec2(aspect,1.);float distance=length(delta);float front=age*.3;float band=exp(-pow((distance-front)/.085,2.));float strength=sin(distance*75.-age*15.)*.016*exp(-age*1.35)*band;offset+=delta/max(distance,.001)*strength/vec2(aspect,1.);}}gl_FragColor=texture2D(picture,clamp(uv+offset,vec2(.001),vec2(.999)));}');
 const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.uniform1i(gl.getUniformLocation(program,'picture'),0);
 const timeLocation=gl.getUniformLocation(program,'now'),aspectLocation=gl.getUniformLocation(program,'aspect'),waveLocation=gl.getUniformLocation(program,'waves[0]');
 function render(time=performance.now()){
  frame=0;if(!ready||document.hidden)return;
  const seconds=time/1000;
  while(waves.length&&seconds-waves[0].time>2.4)waves.shift();
  const values=new Float32Array(24);
  waves.forEach((wave,i)=>{values[i*4]=wave.x;values[i*4+1]=wave.y;values[i*4+2]=wave.time;values[i*4+3]=1;});
  gl.uniform4fv(waveLocation,values);gl.uniform1f(timeLocation,seconds);gl.uniform1f(aspectLocation,canvas.width/canvas.height);
  gl.drawArrays(gl.TRIANGLES,0,6);
  if(waves.length)frame=requestAnimationFrame(render);
 }
 function resize(){const bounds=media.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.max(1,Math.round(bounds.width*dpr));canvas.height=Math.max(1,Math.round(bounds.height*dpr));gl.viewport(0,0,canvas.width,canvas.height);if(!frame)render();}
 function load(){try{gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);ready=true;resize();media.classList.add('ripple-ready');}catch(error){console.warn('Image ripple unavailable:',error.message);}}
 if(image.complete&&image.naturalWidth)load();else image.addEventListener('load',load,{once:true});
 new ResizeObserver(resize).observe(media);
 function emit(event){
  if(event.pointerType==='touch'||!ready)return;
  const now=performance.now(),bounds=media.getBoundingClientRect();
  if(now-lastEmit<85)return;
  if(lastPoint&&Math.hypot(event.clientX-lastPoint.x,event.clientY-lastPoint.y)<8)return;
  lastEmit=now;lastPoint={x:event.clientX,y:event.clientY};
  waves.push({x:(event.clientX-bounds.left)/bounds.width,y:1-(event.clientY-bounds.top)/bounds.height,time:now/1000});if(waves.length>6)waves.shift();
  if(!frame)frame=requestAnimationFrame(render);
 }
 media.addEventListener('pointerenter',event=>{lastEmit=0;lastPoint=null;emit(event);});media.addEventListener('pointermove',emit);
 media.addEventListener('pointerleave',()=>{lastPoint=null;});
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);frame=0;if(!document.hidden&&ready)render();});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;cancelAnimationFrame(frame);media.classList.remove('ripple-ready');});
 }catch(error){media.classList.remove('ripple-ready');console.warn('Image ripple unavailable:',error.message);}
})();