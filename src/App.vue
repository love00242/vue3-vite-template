<script setup>
import { RouterLink, RouterView } from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
</script>

<template>
  <header>
    <div class="wrapper">
      <HelloWorld msg="You did it!" />
      <h2 class="text-red-500 text-xl">YA</h2>
      <SvgIcon name="test"></SvgIcon>
      <img src="images/test.png" alt="">
      <nav>
        <RouterLink to="/">Home</RouterLink>
      </nav>
    </div>
  </header>
  <RouterView />
</template>

<style scoped>
header {
  @apply
  text-red-500
  max-h-screen
  leading-normal;
}
</style>
