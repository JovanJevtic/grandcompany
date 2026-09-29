// Material variation in model units: grain does not stretch with slab UVs.
// No per-frame textures or extra scene draws; compatible with instanced meshes.
export function applyConstructionSurfaces(m) {
  const noise=`
    varying vec3 vConstructionPosition;
    float constructionHash(vec3 p) {
      p=fract(p*.1031);p+=dot(p,p.yzx+33.33);
      return fract((p.x+p.y)*p.z);
    }
    float constructionNoise(vec3 p) {
      vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
      return mix(mix(mix(constructionHash(i),constructionHash(i+vec3(1,0,0)),f.x),
                     mix(constructionHash(i+vec3(0,1,0)),constructionHash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(constructionHash(i+vec3(0,0,1)),constructionHash(i+vec3(1,0,1)),f.x),
                     mix(constructionHash(i+vec3(0,1,1)),constructionHash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
  `;
  function finish(material,kind) {
    const paved=['ground','asphalt','paving'].includes(kind);
    if(paved){material.transparent=true;material.depthWrite=false;}
    material.customProgramCacheKey=()=>`construction-surface-v18-${kind}`;
    material.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vConstructionPosition;');
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        vec4 constructionPosition=vec4(transformed,1.0);
        #ifdef USE_INSTANCING
          constructionPosition=instanceMatrix*constructionPosition;
        #endif
        vConstructionPosition=(modelMatrix*constructionPosition).xyz;
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\n${noise}`);
      const variation=kind==='concrete'?`
        float formwork=1.0-smoothstep(.012,.035,abs(fract(p.y/.59)-.5));
        float streak=constructionNoise(vec3(p.x*4.0,p.y*.16,p.z*4.0));
        vec3 face=normalize(cross(dFdx(p),dFdy(p)));
        float vertical=1.0-abs(face.y);
        vec2 castUV=abs(face.z)>abs(face.x)?p.xy:p.zy;
        vec2 tie=abs(mod(castUV+vec2(.4,.3),vec2(.8,.6))-vec2(.4,.3));
        float tieHole=(1.0-smoothstep(.012,.023,length(tie)))*vertical;
        float closeDetail=1.0-smoothstep(.012,.06,length(fwidth(p)));
        diffuseColor.rgb*=.88+.16*cloud+.035*grain;
        diffuseColor.rgb*=1.0-.035*formwork*vertical-.085*pow(streak,3.0)-.28*tieHole*closeDetail;
        diffuseColor.rgb*=1.0-.12*pow(1.0-grain,8.0)*closeDetail;
      `:kind==='ground'||kind==='paving'?`
        diffuseColor.rgb*=.96+.055*grain;
        vec2 panel=abs(fract(p.xz/5.0)-.5);
        float joint=1.0-smoothstep(.003,.011,min(panel.x,panel.y));
        diffuseColor.rgb*=1.0-.07*joint;
      `:kind==='asphalt'?`
        diffuseColor.rgb*=.62+.34*cloud+.28*grain;
        float track=1.0-smoothstep(.10,.30,min(abs(p.z-7.25),abs(p.z-8.75)));
        diffuseColor.rgb*=1.0-track*.19;
      `:kind==='brick'?`
        vec3 cell=floor(p*vec3(3.0,5.0,3.0));
        diffuseColor.rgb*=.88+.13*constructionHash(cell)+.035*grain;
      `:`diffuseColor.rgb*=.88+.13*cloud+.035*grain;`;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec3 p=vConstructionPosition;
        float cloud=constructionNoise(p*.85);
        float grain=constructionNoise(p*27.0);
        ${variation}
        ${paved?'diffuseColor.a*=1.0-smoothstep(35.0,65.0,length((p.xz-vec2(4.0,-6.0))*vec2(.85,1.0)));':''}
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        roughnessFactor=clamp(roughnessFactor+(grain-.5)*.07,.12,1.0);
      `);
    };
  }
  for(const key of ['concrete','slab','pale','facade'])finish(m[key],'concrete');
  finish(m.ground,'ground');finish(m.paving,'paving');finish(m.earth,'concrete');
  finish(m.asphalt,'asphalt');finish(m.brick,'brick');finish(m.cargo,'brick');
  for(const key of ['yellow','white','steel','galvanized'])finish(m[key],'paint');
}
