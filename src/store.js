import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		notes: [],
		notesIds: {},
	},

	getters: {
		getNote: (state) => (id) => {
			if (state.notesIds[id].error) {
				OC.Notification.show(
					state.notesIds[id].errorMessage,
					{ type: 'error' }
				)
				return false
			}
			return state.notesIds[id]
		},

		getCategories: (state) => (maxLevel, details) => {
			function nthIndexOf(str, pattern, n) {
				let i = -1
				while (n-- && i++ < str.length) {
					i = str.indexOf(pattern, i)
					if (i < 0) {
						break
					}
				}
				return i
			}

			let categories = {}
			let notes = state.notes
			for (let i = 0; i < notes.length; i += 1) {
				let cat = notes[i].category
				if (maxLevel > 0) {
					let index = nthIndexOf(cat, '/', maxLevel)
					if (index > 0) {
						cat = cat.substring(0, index)
					}
				}
				if (categories[cat] === undefined) {
					categories[cat] = 1
				} else {
					categories[cat] += 1
				}
			}
			let result = []
			for (let category in categories) {
				if (details) {
					result.push({
						name: category,
						count: categories[category],
					})
				} else if (category) {
					result.push(category)
				}
			}
			if (details) {
				result.sort(function(a, b) {
					return (a.name).localeCompare(b.name)
				})
			} else {
				result.sort()
			}
			return result
		},
	},

	mutations: {
		add(state, updated) {
			let note = state.notesIds[updated.id]
			if (note) {
				// don't update meta-data over full data
				if (updated.content !== null || note.content === null) {
					note.title = updated.title
					note.modified = updated.modified
					note.content = updated.content
					note.favorite = updated.favorite
					note.category = updated.category
					note.error = updated.error
					note.errorMessage = updated.errorMessage
				}
			} else {
				state.notes.push(updated)
				state.notesIds[updated.id] = updated
			}
		},

		remove(state, id) {
			for (let i = 0; i < state.notes.length; i++) {
				let note = state.notes[i]
				if (note.id === id) {
					state.notes.splice(i, 1)
					delete state.notesIds[id]
					break
				}
			}
		},
	},

	actions: {
		addAll(context, notes) {
			for (let i = 0; i < notes.length; i++) {
				context.commit('add', notes[i])
			}
		},
	},
})