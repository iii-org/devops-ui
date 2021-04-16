<template>
  <div class="circleBase">
    <div class="description">
      <h1>{{ count }}</h1>
      <p>{{ item }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CircleDashboard',
  props: {
    count: {
      type: Number,
      default: 0
    },
    item: {
      type: String,
      default: null
    }
  }
}
</script>

<style lang="scss" scoped>
.circleBase {
  margin: auto;
  width: 10.5vw;
  height: 10.5vw;
  border-radius: 50%;
  border: #000000 1.125vw solid;
  position: relative;
  background: #FFFFFF;

  .description {
    margin: 0;
    text-align: center;

    h1 {
      font-size: 3.25vw;
      line-height: 0.75vw;
    }
  }

}
</style>
