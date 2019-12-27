<template>
  <div class="quota">
    <div class="quota-fixed">
      <div class="quota-header quota-row">
        <div class="header-cell row-cell row-cell--name">Name</div>
        <div class="header-cell row-cell row-cell--weekly">Quota per week</div>
        <div class="header-cell row-cell row-cell--average">Average</div>
      </div>
      <div class="quota-row" v-for="(user, i) in users" :key="user.name + '-' + i">
        <div class="row-cell row-cell--name">{{ user.name }}</div>
        <div class="row-cell row-cell--weekly">{{ user.weeklyQuota }}</div>
        <div class="row-cell row-cell--average">{{ user.averageQuota }}</div>
      </div>
    </div>
    <div class="quota-scrolled">
      <div class="quota-header quota-row">
        <div class="header-cell row-cell">1</div>
        <div class="header-cell row-cell">2</div>
        <div class="header-cell row-cell">3</div>
      </div>
      <div class="quota-row" v-for="(user, i) in users" :key="user.name + '-' + i">
        <template v-for="(day, i) in user.days">
          <div class="row-cell" :key="day.day + '-' + i">{{ day.quota }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'quota',
  mounted () {
    console.debug('mounted!')
  },
  data () {
    return {
      users: {
        first: {
          name: 'Alice Cooper',
          weeklyQuota: 25,
          averageQuota: 23,
          days: {
            one: {
              day: 1,
              quota: 24
            },
            second: {
              day: 2,
              quota: 23
            },
            third: {
              day: 3,
              quota: 22
            }
          }
        },
        second: {
          name: 'Ann Kennedy',
          weeklyQuota: 26,
          averageQuota: 24,
          days: {
            one: {
              day: 1,
              quota: 22
            },
            second: {
              day: 2,
              quota: 23
            },
            third: {
              day: 3,
              quota: 22
            }
          }
        },
        third: {
          name: 'Brenan Mason',
          weeklyQuota: 24,
          averageQuota: 20,
          days: {
            one: {
              day: 1,
              quota: 21
            },
            second: {
              day: 2,
              quota: 23
            },
            third: {
              day: 3,
              quota: 22
            }
          }
        }
      }
    }
  },
  methods () {}
}
</script>

<style lang="scss" scoped>
  .dark {
    .quota {
      color: $white;
    }
    .row-cell {
      border-bottom-color: $dark-grey-lightest;
    }
    .quota-row:nth-child(odd):not(.quota-header) .row-cell {
      background-color: $light-grey-light;
      color: $dark-grey;
    }
  }
  .quota {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    max-width: 100%;
    color: $dark-grey;
  }
  .quota-fixed {
    display: flex;
    flex-direction: column;
    flex: 0 0 auto;
  }
  .quota-scrolled {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    overflow: hidden;
    overflow-x: auto;
  }
  .quota-row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
  .row-cell {
    width: 4rem;
    padding: 1rem;
    border-bottom: 1px solid $dark-grey;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }
  .quota-row:last-child .row-cell {
    border: 0;
  }
  .row-cell--name {
    width: 12rem;
    text-align: left;
  }
  .row-cell--weekly {
    width: 10rem;
  }
  .row-cell--average {
    width: 8rem;
  }
</style>
