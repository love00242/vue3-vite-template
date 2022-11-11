<script setup>
import { ref, computed } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import PDF from './components/PDF.vue';

const canvas = ref(null);
const showImg = ref(null);
const drawFlag = ref(false);
const context = computed(() => canvas.value?.getContext("2d"));

const getPaintPosition = (e) => {
  const canvasSize = canvas.value.getBoundingClientRect();
  if (e.type === "mousemove") {
    return {
      x: e.clientX - canvasSize.left,
      y: e.clientY - canvasSize.top,
    }
  } else {
    return {
      x: e.touches[0].clientX - canvasSize.left,
      y: e.touches[0].clientY - canvasSize.top,
    }
  }
}
const startDraw = (e) => {
  console.log("mousedown", e);
  e.preventDefault();
  // 設定線條的相關數值
  context.value.lineWidth = 1;
  context.value.strokeStyle = "black";
  drawFlag.value = true;
}
const drawing = (e) => {
  if (!drawFlag.value) return;
  const { x, y } = getPaintPosition(e);
  context.value.lineTo(x, y); //設定移動到的位置
  context.value.stroke(); //畫出圖形邊框
}
const finishedDraw = () => {
  drawFlag.value = false;
  context.value.beginPath();
}
const reset = () => {
  context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
}
const saveSign = () => {
  const data = canvas.value.toDataURL("image/png"); //圖片儲存的類型選擇png
  showImg.value.src = data;
  localStorage.setItem('img', data);
}
</script>

<template>
  <header>
    <div class="wrapper">
      <HelloWorld msg="You did it!" />
      <h2 class="text-red-500 text-xl">YA</h2>
      <SvgIcon name="test"></SvgIcon>
      <img class="testImg" src="images/test.png" alt="">
      <nav>
        <RouterLink to="/">Home</RouterLink>
      </nav>
      <div class="sign">
        <canvas ref="canvas" width="500" height="300" style="border: 1px solid #000" @mousedown="startDraw"
          @mousemove="drawing" @mouseup="finishedDraw">
        </canvas>
        <img ref="showImg" width="250" height="100" style="border: 1px solid">
      </div>
      <button @click="reset">清除</button>
      <button @click="saveSign">儲存</button>
      <PDF :url="'/src/Discord.pdf'" />
    </div>
  </header>
  <RouterView />
</template>

<style scoped>
header {
  @apply max-h-screen leading-normal;
}

.testImg {
  @apply w-1/2;
}

.wrapper {
  @apply py-10;
}

.sign {
  @apply flex;
}

canvas {
  @apply mx-10;
}

button {
  @apply border border-black ml-10 my-2 px-1 py-1 rounded-md text-black;
}
</style>
