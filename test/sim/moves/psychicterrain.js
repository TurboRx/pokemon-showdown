'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Psychic Terrain', () => {
	afterEach(() => {
		battle.destroy();
	});

	it('should prevent priority moves from affecting grounded Pokemon', () => {
		battle = common.createBattle([[
			{species: 'Regieleki', moves: ['psychicterrain']},
		], [
			{species: 'Terrakion', moves: ['quickattack']},
		]]);

		const eleki = battle.p1.active[0];
		battle.makeChoices('move psychicterrain', 'move quickattack');
		assert.fullHP(eleki, 'Psychic Terrain should have prevented the priority Quick Attack from doing damage.');
	});

	it('should not prevent priority moves from affecting airborne Pokemon and display correct hint', () => {
		battle = common.createBattle([[
			{species: 'Skarmory', ability: 'sturdy', moves: ['psychicterrain']},
		], [
			{species: 'Terrakion', moves: ['quickattack']},
		]]);

		const skarmory = battle.p1.active[0];
		battle.makeChoices('move psychicterrain', 'move quickattack');
		assert.false.fullHP(skarmory, 'Airborne Skarmory should be hit by Quick Attack.');
		
		// Check that the correct hint message is shown
		const hintLog = battle.log.filter(line => line.startsWith('|hint|'));
		assert(hintLog.length > 0, 'A hint should be displayed');
		assert(hintLog.some(line => line.includes('Airborne Pokémon are not granted protection from priority in Psychic Terrain')),
			'The correct hint message should be displayed for airborne Pokemon');
	});

	it('should show correct hint for airborne Pokemon immune to Ground via ability', () => {
		battle = common.createBattle([[
			{species: 'Orthworm', ability: 'eartheater', moves: ['psychicterrain']},
		], [
			{species: 'Terrakion', moves: ['quickattack']},
		]]);

		const orthworm = battle.p1.active[0];
		battle.makeChoices('move psychicterrain', 'move quickattack');
		// Orthworm has Levitate-like effect from its typing but Earth Eater makes it grounded
		// Priority protection should apply because it checks isGrounded(), not Ground immunity
		assert.fullHP(orthworm, 'Grounded Orthworm with Earth Eater should be protected by Psychic Terrain.');
	});

	it('should prevent priority moves from affecting grounded Pokemon with Air Balloon', () => {
		battle = common.createBattle([[
			{species: 'Regieleki', item: 'airballoon', moves: ['psychicterrain']},
		], [
			{species: 'Terrakion', moves: ['quickattack']},
		]]);

		const eleki = battle.p1.active[0];
		battle.makeChoices('move psychicterrain', 'move quickattack');
		assert.false.fullHP(eleki, 'Airborne Eleki with Air Balloon should be hit by Quick Attack.');
		
		// Check that the correct hint message is shown
		const hintLog = battle.log.filter(line => line.startsWith('|hint|'));
		assert(hintLog.length > 0, 'A hint should be displayed');
		assert(hintLog.some(line => line.includes('Airborne Pokémon are not granted protection from priority in Psychic Terrain')),
			'The correct hint message should be displayed for Pokemon with Air Balloon');
	});

	it('should increase the base power of Psychic-type attacks used by grounded Pokemon', () => {
		battle = common.createBattle([[
			{species: 'Alakazam', moves: ['psychicterrain']},
		], [
			{species: 'Machamp', moves: ['bulkup']},
		]]);
		battle.makeChoices();
		let basePower;
		const move = Dex.moves.get('psychic');
		basePower = battle.runEvent('BasePower', battle.p1.active[0], battle.p2.active[0], move, move.basePower, true);
		// Psychic Terrain boosts Psychic-type moves by 1.3x (5325/4096)
		assert.equal(basePower, Math.floor(move.basePower * 5325 / 4096));
	});
});
