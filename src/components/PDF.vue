<script setup>
import { ref, onMounted, computed } from 'vue';
import { fabric } from 'fabric';
import * as PDFJS from 'pdfjs-dist';
import jsPDF from 'jspdf';
//傳入PDFJS.version可提高引入的靈活性
PDFJS.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

const props = defineProps({
  url: String,
});
const pdfDoc = ref(null);
const nowPage = ref(1);
const totalPage = ref(0);
const pdfCanvas = ref(null);
const canvas = computed(() => new fabric.Canvas("canvasBox"));
const sign = ref(null);
const context = computed(() => pdfCanvas.value?.getContext("2d"));

//純顯示PDF------------------
const _renderPage = async (data) => {
  console.log("render");
  pdfDoc.value = await PDFJS.getDocument(data).promise;

  totalPage.value = pdfDoc.value.numPages; //總頁數
  const pdfPage = await pdfDoc.value.getPage(nowPage.value);

  const viewport = pdfPage.getViewport({ scale: 1 }); //設定PDF內容顯示比例
  //設定canvas大小與PDF相等
  pdfCanvas.value.width = viewport.width;
  pdfCanvas.value.height = viewport.height;
  //實際渲染 PDF
  pdfPage.render({
    canvasContext: context.value,
    viewport: viewport,
  })
}
// const UploadPDF = (e) => {
//   if (e.target.files[0] === undefined) return;
//   const file = e.target.files[0];

//   const fileReader = new FileReader();
//   fileReader.readAsArrayBuffer(file);
//   // 綁入事件監聽
//   fileReader.onload = () => {
//     // 獲取readAsArrayBuffer產生的結果，並用來渲染PDF
//     const typedarray = new Uint8Array(fileReader.result);
//     _renderPage(typedarray);
//   };
// }

//PDF拖拉簽名-----------------------------------
const readBlob = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    }
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  })
}
const printPDF = async (pdfData) => {
  const Base64Prefix = "data:application/pdf;base64,";
  pdfData = await readBlob(pdfData);
  // 將 base64 中的前綴刪去，並進行解碼
  const data = atob(pdfData.substring(Base64Prefix.length));
  // 利用解碼的檔案，載入 PDF 檔及第一頁
  const pdfDoc = await PDFJS.getDocument({ data }).promise;
  const pdfPage = await pdfDoc.getPage(1);
  // 設定尺寸及產生 canvas
  const viewport = pdfPage.getViewport({ scale: window.devicePixelRatio*2 }); // 增加清晰度
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  // 設定 PDF 所要顯示的寬高及渲染
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  const renderContext = {
    canvasContext: context,
    viewport,
  };
  const renderTask = pdfPage.render(renderContext);
  // 回傳做好的 PDF canvas
  return renderTask.promise.then(() => canvas);
}
const pdfToImage = async (pdfData) => {
  // 設定 PDF 轉為圖片時的比例
  const scale = 1 / window.devicePixelRatio;
  // 回傳圖片
  return new fabric.Image(pdfData, {
    scaleX: scale,
    scaleY: scale,
  });
}
// 此處 canvas 套用 fabric.js
const UploadPDF = async (e) => {
  if (e.target.files[0] === undefined) return;
  canvas.value.requestRenderAll();
  const pdfData = await printPDF(e.target.files[0]);
  const pdfImage = await pdfToImage(pdfData);
  // 透過比例設定 canvas 尺寸
  console.log(pdfImage.width / window.devicePixelRatio, pdfImage.height / window.devicePixelRatio);
  canvas.value.setWidth(pdfImage.width / window.devicePixelRatio);
  canvas.value.setHeight(pdfImage.height / window.devicePixelRatio);
  // 將 PDF 畫面設定為背景
  canvas.value.setBackgroundImage(pdfImage, canvas.value.renderAll.bind(canvas.value));
}
const putPDF = () => {
  console.log("putPDF");
  if (!sign.value.src) return;
  fabric.Image.fromURL(sign.value.src, function (image) {
    // 設定簽名出現的位置及大小，後續可調整
    image.top = 400;
    image.scaleX = 0.5;
    image.scaleY = 0.5;
    canvas.value.add(image);
  })
}
//下載簽名PDF------------------
const download = () => {
  const pdf = new jsPDF();
  //將 canvas 存為圖片
  const image = canvas.value.toDataURL("image/png");
  // 設定背景在 PDF 中的位置及大小
  const width = pdf.internal.pageSize.width;
  const height = pdf.internal.pageSize.height;
  pdf.addImage(image, "png", 0, 0, width, height);
  // 將檔案取名並下載
  pdf.save("download.pdf");
  console.log(pdf, width, height, "jsPDF");
}
onMounted(() => {
  console.log("111", PDFJS);
  props.url && _renderPage(props.url);
  if (localStorage.getItem("img")) {
    sign.value.src = localStorage.getItem("img");
  }
});
</script>

<template>
  <div>
    <input type="file" class="select" @change="UploadPDF" accept="application/pdf" />
    <img ref="sign" style="border: 1px solid #000" width="250" height="150" @click="putPDF" />
  </div>
  <canvas id="canvasBox" ref="pdfCanvas" style="border: 1px solid #000"> </canvas>
  <button @click="download">download PDF</button>
</template>

<style scoped>
button {
  @apply border border-black ml-10 my-2 px-1 py-1 rounded-md text-black;
}
</style>