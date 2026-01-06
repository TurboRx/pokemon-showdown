export const Formats: import('../sim/dex-formats').FormatList = [
	{
		section: "Turbo Meta's",
		column: 2,
	},
	{
		name: "[Gen 9] Gravity Rush OU",
		desc: `OU with permanent Gravity field effect and all sleep-inducing moves banned.`,
		mod: 'gen9',
		ruleset: ['Standard', 'Evasion Abilities Clause'],
		banlist: [
			'Uber', 'AG', 'Arena Trap', 'Moody', 'Shadow Tag', 'King\'s Rock', 'Razor Fang', 'Baton Pass', 'Last Respects', 'Shed Tail',
			'Dark Void', 'Grass Whistle', 'Hypnosis', 'Lovely Kiss', 'Sing', 'Sleep Powder', 'Spore', 'Yawn',
		],
		onBegin() {
			this.field.addPseudoWeather('gravity');
		},
	},
	{
		name: "[Gen 9] StormShift OU",
		desc: `OU with weather randomly changing every 5 turns. All weather moves, auto-weather abilities, and weather-extending items are banned.`,
		mod: 'gen9',
		ruleset: ['Standard', 'Evasion Abilities Clause', 'Sleep Moves Clause', '!Sleep Clause Mod'],
		banlist: [
			'Uber', 'AG', 'Arena Trap', 'Moody', 'Shadow Tag', 'King\'s Rock', 'Razor Fang', 'Baton Pass', 'Last Respects', 'Shed Tail',
			'Drought', 'Drizzle', 'Sand Stream', 'Snow Warning', 'Primordial Sea', 'Desolate Land', 'Delta Stream',
			'Rain Dance', 'Sunny Day', 'Sandstorm', 'Snowscape', 'Hail',
			'Damp Rock', 'Heat Rock', 'Icy Rock', 'Smooth Rock',
		],
		onBegin() {
			const weathers = ['sunnyday', 'raindance', 'sandstorm', 'snow'];
			const randomWeather = this.sample(weathers);
			this.field.setWeather(randomWeather);
			this.add('-message', `The weather shifted to ${randomWeather}!`);
		},
		onResidualOrder: 1,
		onResidual() {
			if (this.turn % 5 === 0) {
				const weathers = ['sunnyday', 'raindance', 'sandstorm', 'snow'];
				const randomWeather = this.sample(weathers);
				this.field.setWeather(randomWeather);
				this.add('-message', `The weather shifted to ${randomWeather}!`);
			}
		},
	},
];
