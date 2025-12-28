/**
 * Battle AI Challenge System
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * Allows users to test their skills against an AI opponent through /playertest
 * Implements a floor-based progression system
 *
 * @license MIT
 */

import {FS, Utils} from '../../lib';
import {BattleReady} from '../ladders-challenges';

interface BattleAIProgress {
	floor: number;
	lastAttempt: number;
}

// Store user progress
const progressData = new Map<ID, BattleAIProgress>();

// Load progress from file
function loadProgress() {
	try {
		const data = FS('config/battle-ai-progress.json').readIfExistsSync();
		if (data) {
			const parsed = JSON.parse(data);
			for (const [userid, progress] of Object.entries(parsed)) {
				progressData.set(userid as ID, progress as BattleAIProgress);
			}
		}
	} catch (e) {
		// File doesn't exist yet or is corrupted
	}
}

// Save progress to file
function saveProgress() {
	const data: {[userid: string]: BattleAIProgress} = {};
	for (const [userid, progress] of progressData.entries()) {
		data[userid] = progress;
	}
	FS('config/battle-ai-progress.json').writeUpdate(() => JSON.stringify(data));
}

// Get user progress
function getUserProgress(userid: ID): BattleAIProgress {
	if (!progressData.has(userid)) {
		progressData.set(userid, {floor: 1, lastAttempt: 0});
	}
	return progressData.get(userid)!;
}

// Update user progress
function updateProgress(userid: ID, floor: number) {
	progressData.set(userid, {floor, lastAttempt: Date.now()});
	saveProgress();
}

// Generate AI name based on floor
function getAIName(floor: number): string {
	// Generate a more varied name with floor number
	return `AI ${floor}`;
}

// Get format based on floor (can be customized for difficulty)
function getFormatForFloor(floor: number): string {
	// Start with gen9randombattle, can add more formats for higher floors
	if (floor <= 3) {
		return 'gen9randombattle';
	} else if (floor <= 6) {
		return 'gen9ou';
	} else if (floor <= 10) {
		return 'gen9ubers';
	} else {
		return 'gen9anythinggoes';
	}
}

// AI Request Handler - makes decisions for the AI
class AIRequestHandler {
	private battle: RoomBattle;
	private aiPlayer: RoomBattlePlayer;
	
	constructor(battle: RoomBattle, aiPlayer: RoomBattlePlayer) {
		this.battle = battle;
		this.aiPlayer = aiPlayer;
	}
	
	// Handle a request and make a random choice
	handleRequest(requestData: any) {
		// Wait a bit before responding to simulate thinking
		setTimeout(() => {
			if (this.battle.ended) return;
			
			const request = requestData;
			let choice = '';
			
			if (request.wait) {
				// Just waiting, do nothing
				return;
			} else if (request.forceSwitch) {
				// Need to switch
				const pokemon = request.side.pokemon;
				const switches = [];
				for (let i = 0; i < pokemon.length; i++) {
					if (request.forceSwitch[i]) {
						// Find first valid switch target
						for (let j = 0; j < pokemon.length; j++) {
							if (!pokemon[j].active && !pokemon[j].condition.endsWith(' fnt')) {
								switches.push(`switch ${j + 1}`);
								break;
							}
						}
						if (switches.length <= i) {
							switches.push('pass');
						}
					} else {
						switches.push('pass');
					}
				}
				choice = switches.join(', ');
			} else if (request.teamPreview) {
				// Team preview - just use default order
				choice = 'default';
			} else if (request.active) {
				// Battle turn - choose a random move
				const choices = [];
				for (let i = 0; i < request.active.length; i++) {
					const active = request.active[i];
					const pokemon = request.side.pokemon[i];
					
					if (!pokemon || pokemon.condition.endsWith(' fnt')) {
						choices.push('pass');
						continue;
					}
					
					// Try to use a random available move
					const availableMoves = [];
					if (active.moves) {
						for (let j = 0; j < active.moves.length; j++) {
							if (!active.moves[j].disabled) {
								availableMoves.push(j + 1);
							}
						}
					}
					
					if (availableMoves.length > 0) {
						// Pick a random move
						const moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
						choices.push(`move ${moveIndex}`);
					} else {
						// No moves available, try to switch
						let switched = false;
						for (let j = 0; j < request.side.pokemon.length; j++) {
							const switchTarget = request.side.pokemon[j];
							if (!switchTarget.active && !switchTarget.condition.endsWith(' fnt')) {
								choices.push(`switch ${j + 1}`);
								switched = true;
								break;
							}
						}
						if (!switched) {
							choices.push('pass');
						}
					}
				}
				choice = choices.join(', ');
			}
			
			if (choice) {
				// Send the choice to the battle
				this.battle.choose(this.aiPlayer.user, choice);
			}
		}, 500 + Math.random() * 1000); // Random delay between 0.5-1.5 seconds
	}
}

// Create a fake AI user
function createAIUser(aiName: string): User {
	// Create a minimal connection object
	const fakeConnection = {
		ip: '127.0.0.1',
		protocol: 'websocket',
		user: null as User | null,
		worker: null,
		socketid: '',
		id: '',
	} as Connection;

	// Create the AI user
	const aiUser = new Users.User(fakeConnection);
	aiUser.name = aiName;
	aiUser.named = false; // Set to false so it doesn't appear in user lists
	aiUser.registered = false;
	aiUser.id = toID(aiName);
	
	// Mark as a bot so it doesn't appear in normal user lists
	aiUser.isPublicBot = true;
	
	// Add a custom property to identify it as a Battle AI
	(aiUser as any).isBattleAI = true;
	
	// Don't add to regular user tracking since it's temporary
	Users.users.set(aiUser.id, aiUser);
	
	return aiUser;
}

// Clean up AI user
function removeAIUser(aiUser: User) {
	Users.users.delete(aiUser.id);
	aiUser.disconnectAll();
}

export const commands: Chat.ChatCommands = {
	playertest(target, room, user) {
		// Must be used in a PM or lobby
		if (room && room.roomid !== 'lobby') {
			return this.errorReply("Please use this command in PMs or the lobby.");
		}

		// Get user's current progress
		const progress = getUserProgress(user.id);
		const floor = progress.floor;

		// Create AI opponent
		const aiName = getAIName(floor);
		const aiUser = createAIUser(aiName);

		// Get format for this floor
		const formatid = getFormatForFloor(floor);
		const format = Dex.formats.get(formatid);

		// Validate format
		if (!format.exists) {
			removeAIUser(aiUser);
			return this.errorReply(`Format ${formatid} not found.`);
		}

		// Generate random teams for both players
		const generator = Dex.formats.getRuleTable(format).pickedTeamSize || 0;
		
		try {
			// Create battle ready objects for both players
			const p1ready = new BattleReady(
				user.id,
				formatid,
				user.battleSettings,
				0,
				'challenge'
			);

			const p2ready = new BattleReady(
				aiUser.id,
				formatid,
				{team: '', hidden: false, inviteOnly: false},
				0,
				'challenge'
			);

			// Create the battle
			const battleRoom = Rooms.createBattle({
				format: formatid,
				players: [
					{user, team: user.battleSettings.team, invite: ''},
					{user: aiUser, team: '', invite: ''},
				],
				rated: false,
				challengeType: 'challenge',
				delayedStart: false,
			});

			if (!battleRoom) {
				removeAIUser(aiUser);
				return this.errorReply("Could not create battle room. The server might be restarting.");
			}

			// Store AI user reference in the battle for cleanup and set up AI handler
			if (battleRoom.battle) {
				(battleRoom.battle as any).aiUser = aiUser;
				const aiPlayer = battleRoom.battle.playerTable[aiUser.id];
				
				if (aiPlayer) {
					// Create AI handler
					const aiHandler = new AIRequestHandler(battleRoom.battle, aiPlayer);
					(battleRoom.battle as any).aiHandler = aiHandler;
					
					// Override the sendRoom method for the AI player to intercept requests
					const originalSendRoom = aiPlayer.sendRoom.bind(aiPlayer);
					aiPlayer.sendRoom = function(data: string) {
						// Check if this is a request
						if (data.startsWith('|request|')) {
							const requestStr = data.slice(9); // Remove "|request|"
							if (requestStr && requestStr !== 'null') {
								try {
									const requestData = JSON.parse(requestStr);
									aiHandler.handleRequest(requestData);
								} catch (e) {
									// Invalid request, ignore
								}
							}
						}
						// Still call original to maintain state
						return originalSendRoom(data);
					};
				}
				
				// Set up battle end handler to clean up AI and update progress
				const originalEnd = battleRoom.battle.end.bind(battleRoom.battle);
				battleRoom.battle.end = function(this: RoomBattle) {
					const winner = this.winner;
					const aiUserId = aiUser.id;
					
					// Check if user won
					if (winner && toID(winner) === user.id) {
						// User won, advance to next floor
						updateProgress(user.id, floor + 1);
						this.add(`|raw|<div class="broadcast-blue"><strong>Congratulations!</strong> You've cleared Floor ${floor}! You can now challenge Floor ${floor + 1}.</div>`);
					} else if (winner && toID(winner) === aiUserId) {
						// AI won, user stays on same floor
						this.add(`|raw|<div class="broadcast-red">You were defeated on Floor ${floor}. Try again!</div>`);
					}
					
					// Call original end
					originalEnd.apply(this, arguments as any);
					
					// Clean up AI user after battle ends
					setTimeout(() => removeAIUser(aiUser), 1000);
				};
			}

			this.sendReply(`|raw|<div class="broadcast-green"><strong>Battle AI Challenge - Floor ${floor}</strong><br/>Format: ${format.name}<br/>Opponent: ${aiName}<br/>Good luck!</div>`);
			
		} catch (e: any) {
			removeAIUser(aiUser);
			Monitor.crashlog(e, 'creating AI battle');
			return this.errorReply(`An error occurred while creating the battle: ${e.message}`);
		}
	},
	playertesthelp: [
		`/playertest - Start a battle against an AI opponent. Progress through floors by defeating the AI. Each floor may have different formats and increased difficulty.`,
	],
	
	playertestprogress: 'playertestfloor',
	playertestfloor(target, room, user) {
		const progress = getUserProgress(user.id);
		this.sendReplyBox(`<strong>Battle AI Progress</strong><br/>Current Floor: ${progress.floor}<br/>Last Attempt: ${progress.lastAttempt ? new Date(progress.lastAttempt).toLocaleString() : 'Never'}`);
	},
	playertestfloorhelp: [`/playertestfloor - Check your current Battle AI floor progress.`],

	playertestrest(target, room, user) {
		this.checkCan('gdeclare');
		if (!target) {
			return this.errorReply("Usage: /playertestrest [user]");
		}
		const targetUser = Users.get(target);
		const userid = targetUser ? targetUser.id : toID(target);
		
		if (progressData.has(userid)) {
			progressData.delete(userid);
			saveProgress();
			return this.sendReply(`Reset Battle AI progress for ${target}.`);
		} else {
			return this.errorReply(`${target} has no Battle AI progress to reset.`);
		}
	},
	playertestresthelp: [`/playertestrest [user] - Reset a user's Battle AI progress. Requires: ~`],
};

// Load progress on startup
loadProgress();
