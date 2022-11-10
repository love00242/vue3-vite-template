<script setup>
import { ref, onMounted, computed } from 'vue';
import * as PDFJS from 'pdfjs-dist';
//傳入PDFJS.version可提高引入的靈活性
PDFJS.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

const props = defineProps({
  url: String,
});
const pdfDoc = ref(null);
const nowPage = ref(1);
const totalPage = ref(0);
const pdfCanvas = ref(null);
const context = computed(() => pdfCanvas.value?.getContext("2d"));

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
const UploadPDF = (e) => {
  if (e.target.files[0] === undefined) return;
  const file = e.target.files[0];

  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);
  // 綁入事件監聽
  fileReader.onload = () => {
    // 獲取readAsArrayBuffer產生的結果，並用來渲染PDF
    const typedarray = new Uint8Array(fileReader.result);
    _renderPage(typedarray);
  };
}
onMounted(() => {
  console.log("111", PDFJS);
  props.url && _renderPage(props.url);
});
</script>

<template>
  <input type="file" class="select" @change="UploadPDF" accept="application/pdf" />
  <canvas ref="pdfCanvas" id="pdfCanvas"></canvas>
</template>