// Pixel-preserving packaging of imagegen edits; no creative image changes here.
// node tools/build_difference_art.js SOURCE_DIR [SHARP_MODULE]
const fs=require('fs'),path=require('path');
const sharp=require(process.argv[3]||'sharp');
const src=process.argv[2],assets=path.join(__dirname,'../assets');
const scenes=[
 {tag:'library',id:'starlight-library',name:'부엉박사와 냐옹이의 별빛 도서관',spots:[
  {name:'매달린 달 장식',box:[32,154,120,130]},
  {name:'등불의 리본',box:[1003,335,70,69]},
  {name:'모래시계의 모래',box:[886,591,64,92]},
  {name:'책의 책갈피',box:[112,796,60,42]},
  {name:'쿠션의 별 자수',box:[940,701,133,93]}]},
 {tag:'garden',id:'glass-garden',name:'토리·타코·도치의 유리 온실 정원',spots:[
  {name:'매달린 종',box:[159,86,118,127]},
  {name:'나비의 날개',box:[893,55,157,159]},
  {name:'기둥의 리본',box:[22,393,129,150]},
  {name:'화분의 꽃잎',box:[929,571,88,89]},
  {name:'바닥의 장갑',box:[156,743,113,72]}]}
];
(async()=>{
 const records=[];
 for(const scene of scenes){
  const scaled=path.join(src,scene.tag+'-scaled.png');
  if(!fs.existsSync(scaled))await sharp(path.join(src,scene.tag+'-original.jpg')).resize({width:1122}).png().toFile(scaled);
  const stem='df-'+scene.tag+'-v97',original=path.join(assets,stem+'.webp'),edited=path.join(assets,'df-'+scene.tag+'-changes-v97.webp');
  await sharp(path.join(src,scene.tag+'-scaled.png')).webp({quality:86,effort:6}).toFile(original);
  const base=await sharp(original).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const patches=[];
  for(const {box:[left,top,width,height]} of scene.spots){
   const crop=await sharp(path.join(src,scene.tag+'-generated-scaled.png')).extract({left,top,width,height}).ensureAlpha().raw().toBuffer();
   // Fade only the inner rim to keep the patch join quiet, with no changes beyond box.
   for(let y=0;y<height;y++)for(let x=0;x<width;x++){const edge=Math.min(x,y,width-1-x,height-1-y);crop[(y*width+x)*4+3]=Math.round(Math.min(1,edge/5)*255);}
   patches.push({input:crop,raw:{width,height,channels:4},left,top});
  }
  await sharp(base.data,{raw:base.info}).composite(patches).webp({lossless:true,effort:6}).toFile(edited);
  const result=await sharp(edited).removeAlpha().raw().toBuffer();let outside=0;const counts=scene.spots.map(()=>0);
  for(let y=0;y<838;y++)for(let x=0;x<1122;x++){let changed=false;for(let c=0;c<3;c++)if(base.data[(y*1122+x)*3+c]!==result[(y*1122+x)*3+c])changed=true;if(changed){const i=scene.spots.findIndex(({box:[l,t,w,h]})=>x>=l&&x<l+w&&y>=t&&y<t+h);if(i<0)outside++;else counts[i]++;}}
  if(outside||counts.some(n=>n<100))throw Error('Pixel validation failed '+scene.tag);
  records.push({id:scene.id,name:scene.name,width:1122,height:838,original:'assets/'+path.basename(original),edited:'assets/'+path.basename(edited),spots:scene.spots.map(({name,box:[x,y,w,h]})=>({x:+((x+w/2)*240/1122).toFixed(3),y:+((y+h/2)*240/1122).toFixed(3),r:+(Math.max(w,h)*.55*240/1122).toFixed(3),n:name,box:[x,y,w,h].map(n=>+(n*240/1122).toFixed(5))})),validation:{outsideChanged:outside,changedPixels:counts,bytes:[fs.statSync(original).size,fs.statSync(edited).size]}});
 }
 fs.writeFileSync(path.join(src,'scene-data.json'),JSON.stringify(records,null,2));console.log(records.map(r=>({id:r.id,...r.validation})));
})().catch(e=>{console.error(e);process.exitCode=1;});
