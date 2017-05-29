<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
#app .router-link-active {
  color: #00d1b2;
}

.page {
  padding: 2em;
  padding-top: 70px;
  background: white;
}

.table td {
  vertical-align: middle;
}

.avatar img {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-right: 0px;
}

body {
  height: 100%;
  min-height: 100%;
  width: 100%;
  background: #EEE;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0;
}

.th-project {
  width: 30px;
  border-radius: 50%;
}

td strong {
  font-size: 1.2em;
}

tr .actions a {
  display: none;
  color: #999;
}

tr:hover .actions a {
  display: inline-flex;
}
</style>
