import { computed, onScopeDispose, ref, watch } from 'vue'

/*
 * Loads what the breakdown page needs for the current production and episode,
 * and keeps it in line with the scope of the store: the topbar can move the
 * production or the episode at any time, including in the middle of a load.
 * onLoaded runs after each successful load, once the assets are there.
 */
export const useBreakdownLoader = (store, onLoaded) => {
  const episodeId = ref('')
  const isLoading = ref(false)

  let hasScopeMoved = false
  // Scope served by the running load, then by the last one.
  let loadProductionId = null
  let loadEpisodeId = null
  let isDisposed = false

  const currentEpisode = computed(() => store.getters.currentEpisode)
  const currentProduction = computed(() => store.getters.currentProduction)
  const isTVShow = computed(() => store.getters.isTVShow)

  const load = async () => {
    if (isDisposed) return
    isLoading.value = true
    loadProductionId = currentProduction.value?.id
    loadEpisodeId = currentEpisode.value?.id
    hasScopeMoved = false
    try {
      // Resolve the episode first: starting on a direct link before the
      // topbar has it costs a full production-wide second pass. Inside the
      // try, so a failed fetch releases the loading flag like any other.
      if (isTVShow.value && !currentEpisode.value) {
        await store.dispatch('loadEpisodes')
        if (isDisposed) return
        loadEpisodeId = currentEpisode.value?.id
        // The watcher flagged the episode this run just resolved: nothing
        // was loaded under another scope yet, the loads start from it.
        hasScopeMoved = false
      }
      // 'all' is episode casting here: it reads neither sequences nor shots.
      if (
        !isTVShow.value ||
        !['main', 'all'].includes(currentEpisode.value?.id)
      ) {
        await store.dispatch('loadSequences')
        if (isDisposed) return
        await store.dispatch('loadShots')
        // Leaving the page during a load must stop the chain: the
        // production-wide assets load would land under the page shown next.
        if (isDisposed) return
      }
      if (isTVShow.value) {
        if (currentEpisode.value) episodeId.value = currentEpisode.value.id
        store.dispatch('setCastingEpisode', episodeId.value)
        store.dispatch('setCastingForProductionEpisodes')
      } else {
        store.dispatch('setCastingEpisode', null)
      }
      await store.dispatch('loadAssets', { all: true, withTasks: true })
      if (isDisposed) return
      onLoaded()
    } catch (err) {
      console.error(err)
    } finally {
      isLoading.value = false
      // The watchers ignore a change made during the load: pick it up here or
      // the casting of the scope left behind stays displayed under a topbar
      // that shows the new one. hasScopeMoved catches a switch that came back
      // to the scope the run started with: the loads in between served the
      // other one.
      const isScopeChanged =
        hasScopeMoved ||
        currentProduction.value?.id !== loadProductionId ||
        currentEpisode.value?.id !== loadEpisodeId
      if (isScopeChanged && !isDisposed) load()
    }
  }

  // The scope is compared, by id, to the one the load serves, not to the
  // previous value. The store rebuilds these objects without moving (the
  // topbar fetches the episodes too), and a watcher reports late: a production
  // set right before the load shows up once it runs. Both made the page load
  // twice.
  watch(currentProduction, () => {
    if (currentProduction.value?.id !== loadProductionId) {
      if (isLoading.value) hasScopeMoved = true
      else load()
    }
  })

  watch(currentEpisode, () => {
    const episode = currentEpisode.value
    if (episode && episode.id !== loadEpisodeId) {
      if (isLoading.value) {
        hasScopeMoved = true
      } else if (episode.id === 'all') {
        episodeId.value = 'all'
        loadEpisodeId = 'all'
      } else {
        load()
      }
    }
  })

  onScopeDispose(() => {
    isDisposed = true
  })

  return { episodeId, isLoading, load }
}
