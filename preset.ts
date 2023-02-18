export default definePreset({
	name: 'presets',
	options: {
		// ...
	},
	handler: async() => {
		await extractTemplates()
		// ...
	},
})
