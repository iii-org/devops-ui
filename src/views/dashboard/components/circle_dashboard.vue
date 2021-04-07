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
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: #000000 15px solid;
  position: relative;
  background: #FFFFFF;

  .description {
    margin: 0;
    text-align: center;

    h1 {
      font-size: 3em;
      line-height: 0.5em;
    }
  }

}
</style>
