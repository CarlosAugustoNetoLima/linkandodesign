import fs from 'fs';
const buf = fs.readFileSync('/Users/carloslima/Downloads/apple_macbook_pro.glb');
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));

console.log('=== SCENE ROOTS ===', JSON.stringify(json.scenes[0].nodes));
console.log('\n=== NODES ===');
json.nodes.forEach((n,i)=>{
  console.log(`node[${i}] "${n.name||''}" mesh=${n.mesh??'-'} children=${JSON.stringify(n.children||[])} `+
    `T=${n.translation?JSON.stringify(n.translation.map(x=>+x.toFixed(3))):''} `+
    `R=${n.rotation?JSON.stringify(n.rotation.map(x=>+x.toFixed(3))):''} `+
    `S=${n.scale?JSON.stringify(n.scale.map(x=>+x.toFixed(3))):''} `+
    `M=${n.matrix?'matrix4':''}`);
});

console.log('\n=== MESH PRIMITIVE ATTRS ===');
const prim = json.meshes[0].primitives[0];
console.log('attributes:', JSON.stringify(prim.attributes), 'indices:', prim.indices, 'mode:', prim.mode??4);
// bounding box from POSITION accessor
const posAcc = json.accessors[prim.attributes.POSITION];
console.log('POSITION count:', posAcc.count, 'min:', JSON.stringify(posAcc.min), 'max:', JSON.stringify(posAcc.max));
const dims = posAcc.max.map((v,i)=>+(v-posAcc.min[i]).toFixed(3));
console.log('DIMENSÕES (x,y,z):', JSON.stringify(dims));

console.log('\n=== MATERIAL 0 CHANNELS ===');
const m = json.materials[0];
const p = m.pbrMetallicRoughness||{};
const texRole = {};
if(p.baseColorTexture) texRole['baseColor'] = p.baseColorTexture.index;
if(p.metallicRoughnessTexture) texRole['metallicRoughness'] = p.metallicRoughnessTexture.index;
if(m.normalTexture) texRole['normal'] = m.normalTexture.index;
if(m.emissiveTexture) texRole['emissive'] = m.emissiveTexture.index;
if(m.occlusionTexture) texRole['occlusion'] = m.occlusionTexture.index;
console.log('texRoles(texIdx):', JSON.stringify(texRole));
console.log('emissiveFactor:', JSON.stringify(m.emissiveFactor||[]), 'alphaMode:', m.alphaMode||'OPAQUE', 'doubleSided:', m.doubleSided);
console.log('full pbr:', JSON.stringify(p));

console.log('\n=== TEXTURES -> IMAGES ===');
(json.textures||[]).forEach((t,i)=>console.log(`tex[${i}] source(image)=${t.source} sampler=${t.sampler}`));
console.log('\n=== IMAGES ===');
(json.images||[]).forEach((im,i)=>console.log(`img[${i}] name="${im.name||''}" mime=${im.mimeType||''} bufferView=${im.bufferView}`));
