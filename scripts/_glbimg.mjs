import fs from 'fs';
const OUT='/private/tmp/claude-501/-Users-carloslima-linkando-design/7aa17e6a-f433-4732-a3ef-b70200db7959/scratchpad';
const buf = fs.readFileSync('/Users/carloslima/Downloads/apple_macbook_pro.glb');
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
// binary chunk starts after json chunk: 12 header + 8 (len+type) + jsonLen, pad to 4
const jsonPad = (jsonLen + 3) & ~3;
const binStart = 12 + 8 + jsonPad + 8; // +8 for bin chunk header
const roles = ['baseColor(0)','metalRough+AO(1)','emissive(2)','normal(3)'];
json.images.forEach((im,i)=>{
  const bv = json.bufferViews[im.bufferView];
  const start = binStart + (bv.byteOffset||0);
  const data = buf.subarray(start, start + bv.byteLength);
  const ext = im.mimeType==='image/jpeg'?'jpg':'png';
  const f = `${OUT}/tex${i}.${ext}`;
  fs.writeFileSync(f, data);
  console.log(`img[${i}] ${roles[i]} -> ${f} (${(bv.byteLength/1024|0)}KB)`);
});
// node0 matrix
console.log('node0 matrix:', JSON.stringify(json.nodes[0].matrix));
