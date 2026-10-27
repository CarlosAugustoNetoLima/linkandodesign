import fs from 'fs';
const buf = fs.readFileSync('/Users/carloslima/Downloads/apple_macbook_pro.glb');
// header: magic(4) version(4) length(4); chunk0: len(4) type(4) data
const jsonLen = buf.readUInt32LE(12);
const jsonType = buf.toString('ascii', 16, 20);
const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
console.log('chunk0 type:', jsonType, 'jsonLen:', jsonLen);
console.log('scenes:', json.scenes?.length, 'nodes:', json.nodes?.length,
  'meshes:', json.meshes?.length, 'materials:', json.materials?.length,
  'textures:', json.textures?.length, 'images:', json.images?.length,
  'animations:', json.animations?.length);
console.log('\n=== MATERIALS ===');
(json.materials||[]).forEach((m,i)=>{
  const p=m.pbrMetallicRoughness||{};
  console.log(`[${i}] "${m.name||''}" metal=${p.metallicFactor??'?'} rough=${p.roughnessFactor??'?'} base=${JSON.stringify(p.baseColorFactor||[])} transmission=${m.extensions?.KHR_materials_transmission?.transmissionFactor??''} baseTex=${p.baseColorTexture?'y':''}`);
});
console.log('\n=== MESHES (name / #prims / material idx) ===');
(json.meshes||[]).forEach((me,i)=>{
  const prims=(me.primitives||[]).map(p=>`mat${p.material}`).join(',');
  console.log(`mesh[${i}] "${me.name||''}" prims=${me.primitives?.length} [${prims}]`);
});
