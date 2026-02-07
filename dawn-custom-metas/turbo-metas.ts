export const Formats: import('../sim/dex-formats').FormatList = [
	{
		section: "Turbo Meta's",
		column: 2,
	},
	{
		name: "StormShift Weather Cycle",
		effectType: 'Rule',
		onResidualOrder: 1,
		onResidual() {
			if (this.turn % 5 === 0 && this.turn > 0) {
				const weathers = ['sunnyday', 'raindance', 'sandstorm', 'snow'];
				const cycleIndex = Math.floor(this.turn / 5) % weathers.length;
				const nextWeather = weathers[cycleIndex];
				(this.field as any).weatherState = {
					id: nextWeather,
					target: this.field,
					source: null,
					sourceSlot: null,
					duration: 0,
				};
				(this.field as any).weather = nextWeather;
				const weatherNames: { [key: string]: string } = {
					sunnyday: 'Sunny Day',
					raindance: 'Rain Dance',
					sandstorm: 'Sandstorm',
					snow: 'Snow',
				};
				this.add('-weather', weatherNames[nextWeather], '[from] Format');
			}
		},
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
			(this.field.pseudoWeather as any)['gravity'] = {
				id: 'gravity',
				target: this.field,
				source: null,
				sourceSlot: null,
				duration: undefined,
			};
			this.add('-fieldstart', 'move: Gravity', '[from] Format');
		},
	},
	{
		name: "[Gen 9] StormShift OU",
		desc: `OU with weather cycling every 5 turns in a predictable pattern: Sunny Day → Rain Dance → Sandstorm → Snow. All weather moves, auto-weather abilities, and weather-extending items are banned.`,
		mod: 'gen9',
		ruleset: ['Standard', 'Evasion Abilities Clause', 'Sleep Moves Clause', '!Sleep Clause Mod', 'StormShift Weather Cycle'],
		banlist: [
			'Uber', 'AG', 'Arena Trap', 'Moody', 'Shadow Tag', 'King\'s Rock', 'Razor Fang', 'Baton Pass', 'Last Respects', 'Shed Tail',
			'Drought', 'Drizzle', 'Sand Stream', 'Snow Warning', 'Primordial Sea', 'Desolate Land', 'Delta Stream',
			'Rain Dance', 'Sunny Day', 'Sandstorm', 'Snowscape', 'Hail',
			'Damp Rock', 'Heat Rock', 'Icy Rock', 'Smooth Rock',
		],
		onBegin() {
			(this.field as any).weatherState = {
				id: 'sunnyday',
				target: this.field,
				source: null,
				sourceSlot: null,
				duration: 0,
			};
			(this.field as any).weather = 'sunnyday';
			this.add('-weather', 'SunnyDay', '[from] Format');
		},
	},
	{
		name: "[Gen 9] Gravity Rush Random Battle",
		desc: `Random teams with a permanent Gravity field effect and all sleep-inducing moves banned.`,
		mod: 'gen9',
		team: 'random',
		ruleset: ['[Gen 9] Random Battle'],
		banlist: [
			'Dark Void', 'Grass Whistle', 'Hypnosis', 'Lovely Kiss', 'Sing', 'Sleep Powder', 'Spore', 'Yawn',
		],
		onBegin() {
			(this.field.pseudoWeather as any)['gravity'] = {
				id: 'gravity',
				target: this.field,
				source: null,
				sourceSlot: null,
				duration: undefined,
			};
			this.add('-fieldstart', 'move: Gravity', '[from] Format');
		},
	},
	{
		name: "[Gen 9] StormShift Random Battle",
		desc: `Random teams with weather cycling every 5 turns in the pattern Sunny → Rain → Sand → Snow. Weather-setting moves/abilities/items remain banned.`,
		mod: 'gen9',
		team: 'random',
		ruleset: ['[Gen 9] Random Battle', 'StormShift Weather Cycle'],
		banlist: [
			'Drought', 'Drizzle', 'Sand Stream', 'Snow Warning', 'Primordial Sea', 'Desolate Land', 'Delta Stream',
			'Rain Dance', 'Sunny Day', 'Sandstorm', 'Snowscape', 'Hail',
			'Damp Rock', 'Heat Rock', 'Icy Rock', 'Smooth Rock',
		],
		onBegin() {
			(this.field as any).weatherState = {
				id: 'sunnyday',
				target: this.field,
				source: null,
				sourceSlot: null,
				duration: 0,
			};
			(this.field as any).weather = 'sunnyday';
			this.add('-weather', 'Sunny Day', '[from] Format');
		},
	},
];
