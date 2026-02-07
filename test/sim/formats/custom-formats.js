'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Custom Formats - Gravity Rush OU', () => {
	afterEach(() => {
		battle.destroy();
	});

	it('should start with Gravity in effect', () => {
		battle = common.createBattle({ formatid: '[Gen 9] Gravity Rush OU' });
		battle.setPlayer('p1', { team: [{ species: 'Aerodactyl', ability: 'pressure', moves: ['tackle'] }] });
		battle.setPlayer('p2', { team: [{ species: 'Aron', ability: 'sturdy', moves: ['earthpower'] }] });
		battle.makeChoices();
		assert(battle.field.pseudoWeather['gravity']);
	});

	it('should allow Ground moves to hit Flying-type Pokemon due to Gravity', () => {
		battle = common.createBattle({ formatid: '[Gen 9] Gravity Rush OU' });
		battle.setPlayer('p1', { team: [{ species: 'Aerodactyl', ability: 'pressure', moves: ['tackle'] }] });
		battle.setPlayer('p2', { team: [{ species: 'Aron', ability: 'sturdy', moves: ['earthpower'] }] });
		battle.makeChoices();
		battle.makeChoices('move tackle', 'move earthpower');
		assert.notEqual(battle.p1.active[0].hp, battle.p1.active[0].maxhp);
	});
});

describe('Custom Formats - StormShift OU', () => {
	afterEach(() => {
		battle.destroy();
	});

	it('should start with Sunny Day weather', () => {
		battle = common.createBattle({ formatid: '[Gen 9] StormShift OU' });
		battle.setPlayer('p1', { team: [{ species: 'Charizard', ability: 'blaze', moves: ['tackle'] }] });
		battle.setPlayer('p2', { team: [{ species: 'Blastoise', ability: 'torrent', moves: ['tackle'] }] });
		battle.makeChoices();
		assert.equal(battle.field.weatherState.id, 'sunnyday');
	});

	it('should cycle weather every 5 turns', () => {
		battle = common.createBattle({ formatid: '[Gen 9] StormShift OU' });
		battle.setPlayer('p1', { team: [{ species: 'Snorlax', ability: 'immunity', level: 100, moves: ['splash'] }] });
		battle.setPlayer('p2', { team: [{ species: 'Snorlax', ability: 'immunity', level: 100, moves: ['splash'] }] });

		battle.makeChoices();
		assert.equal(battle.field.weatherState.id, 'sunnyday');

		for (let i = 0; i < 4; i++) {
			battle.makeChoices();
		}
		assert.equal(battle.field.weatherState.id, 'sunnyday');

		battle.makeChoices();
		assert.equal(battle.field.weatherState.id, 'raindance');
	});
});
