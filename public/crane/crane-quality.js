// Bound GPU allocations while preserving thin cables on high-density displays.
export function craneQuality(width,height,deviceRatio=1,mobile=false,maxTextureSize=8192) {
  const w=Math.max(1,width),h=Math.max(1,height);
  // Desktop: do ~9 Mpx (npr. 1920×1260 platno na 1,5×), cilj je supersampling 2× za glatke ivice.
  const budget=mobile?3000000:9000000;
  const preferred=mobile?2:Math.min(2.5,Math.max(2,deviceRatio));
  const pixelRatio=Math.min(preferred,Math.sqrt(budget/(w*h)),maxTextureSize/w,maxTextureSize/h);
  return {
    pixelRatio,
    shadowSize:Math.min(mobile?2048:4096,maxTextureSize),
    contactSamples:mobile?24:32,
  };
}
