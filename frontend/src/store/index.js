import Vue from 'vue'
import Vuex from 'vuex'

import axios from "axios";

//link should be on secret .env file but since it's just a localhost link, it's fine
const API_URL = "http://localhost:8000/api/"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    movies: {
      count: 0,
      results: []
    },
    actors: {
      count: 0,
      results: []
    },
    reviews: {
      count: 0,
      results: []
    },
  },
  getters: {
    movies: state => state.movies,
    actors: state => state.actors,
    reviews: state => state.reviews,
    actorById: state => id => state.actors.results.find(e => e.id === id) ?? false,
    movieById: state => id => state.movies.results.find(e => e.id === id) ?? false,
    movieIndexId: state => id => state.movies.results.findIndex(e => e.id === id) ?? false
  },

  mutations: {
    editMovies(state, data) {
      state.movies = { ...data }
    },

    editActors(state, data) {
      state.actors = { ...data }
    },

    editReviews(state, data) {
      state.reviews = { ...data }
    },

    addActors(state, data) {
      state.actors.results.push(data)
      state.actors.count ++
    },

    editMovieDescr(state, index, movie) {
      state.movies.results[index] = movie
    }
  },

  actions: {
    async fetchMovies({commit, dispatch}, context) {
      try{
        const {data: {count, results}} = await axios.get(`${API_URL}movies`, {
          params: {
            page: context.page
          }
        })

        for(const res of results){
          const actors = []
          for (const actor of res.actors){
            const raw = await dispatch( 
              {
                type:'fetchActorById',
                id: actor
              })
  
            actors.push(`${raw.first_name} ${raw.last_name}`)
          }
          res.actors = actors
        }
        
        commit('editMovies', {count, results})

      } catch (error){
        alert(error)
      }
    },

    async fetchActors({commit}, context) {
      try{
        const {data: {count, results}} = await axios.get(`${API_URL}actors`, {
          params: {
            page: context.page
          }
        })

        commit('editActors', {count, results})

      } catch (error){
        alert(error)
      }
    },

    // async sortActorsByMovies({dispatch}, results){
    //   console.log(results)
    //   for(const res of results){
    //     const actors = []
    //     for (const actor of res.actors){
    //       const raw = await dispatch( 
    //         {
    //           type:'fetchActorById',
    //           id: actor
    //         })

    //       actors.push(`${raw.first_name} ${raw.last_name}`)
    //     }
    //     res.actors = actors
    //   }
    //   return results
    // },

    async fetchActorById({commit, getters}, context) {
       const find = getters.actorById(context.id)
      if (find)
        return find

      try{
        const {data: {id, first_name, last_name}} = await axios.get(`${API_URL}actors/${context.id}`)

        commit('addActors', {id, first_name, last_name})

        return {id, first_name, last_name}


      } catch (error){
        alert(error)
      }
    },

    async editMovieDescr({commit, getters}, context){
      const movie = getters.movieById(context.id)
      const index = getters.movieIndexId(context.id)
      movie.description = context.descr

      commit('editMovieDescr', {index, movie})
    }
  },
  modules: {
  }
})
