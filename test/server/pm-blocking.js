'use strict';

const assert = require('assert').strict;
const { makeUser, destroyUser } = require('../users-utils');

describe('PM Blocking', () => {
	let recipient, sender, room;

	beforeEach(() => {
		room = Rooms.get('lobby');
		if (!room) {
			room = Rooms.createChatRoom('lobby', 'Lobby', {});
		}
	});

	afterEach(() => {
		if (recipient) destroyUser(recipient);
		if (sender) destroyUser(sender);
	});

	describe('trustedfriends mode', () => {
		it('should allow trusted users (not friends) to PM', () => {
			recipient = makeUser('Recipient');
			recipient.settings.blockPMs = 'trustedfriends';
			recipient.friends = new Set();

			sender = makeUser('TrustedSender');
			sender.autoconfirmed = toID('TrustedSender');
			sender.trusted = toID('TrustedSender');

			const context = new Chat.CommandContext({ user: sender, room, connection: sender.connections[0], message: '' });
			const canPM = context.checkCanPM(recipient, sender);
			assert.equal(canPM, true, 'trusted user should be able to PM');
		});

		it('should allow friends (not trusted) to PM', () => {
			recipient = makeUser('Recipient');
			recipient.settings.blockPMs = 'trustedfriends';
			recipient.friends = new Set([toID('FriendSender')]);

			sender = makeUser('FriendSender');

			const context = new Chat.CommandContext({ user: sender, room, connection: sender.connections[0], message: '' });
			const canPM = context.checkCanPM(recipient, sender);
			assert.equal(canPM, true, 'friend should be able to PM');
		});

		it('should block non-trusted non-friends', () => {
			recipient = makeUser('Recipient');
			recipient.settings.blockPMs = 'trustedfriends';
			recipient.friends = new Set();

			sender = makeUser('RegularSender');

			const context = new Chat.CommandContext({ user: sender, room, connection: sender.connections[0], message: '' });
			const canPM = context.checkCanPM(recipient, sender);
			assert.equal(canPM, false, 'non-trusted non-friend should not be able to PM');
		});

		it('should allow staff to PM regardless', () => {
			recipient = makeUser('Recipient');
			recipient.settings.blockPMs = 'trustedfriends';
			recipient.friends = new Set();

			sender = makeUser('StaffSender');
			sender.tempGroup = '%';

			const context = new Chat.CommandContext({ user: sender, room, connection: sender.connections[0], message: '' });
			const canPM = context.checkCanPM(recipient, sender);
			assert.equal(canPM, true, 'staff should be able to PM');
		});
	});

	describe('friends mode (existing behavior)', () => {
		it('should block trusted users who are not friends', () => {
			recipient = makeUser('Recipient');
			recipient.settings.blockPMs = 'friends';
			recipient.friends = new Set();

			sender = makeUser('TrustedSender');
			sender.autoconfirmed = toID('TrustedSender');
			sender.trusted = toID('TrustedSender');

			const context = new Chat.CommandContext({ user: sender, room, connection: sender.connections[0], message: '' });
			const canPM = context.checkCanPM(recipient, sender);
			assert.equal(canPM, false, 'trusted user (not friend) should not be able to PM in friends mode');
		});

		it('should allow friends to PM', () => {
			recipient = makeUser('Recipient');
			recipient.settings.blockPMs = 'friends';
			recipient.friends = new Set([toID('FriendSender')]);

			sender = makeUser('FriendSender');

			const context = new Chat.CommandContext({ user: sender, room, connection: sender.connections[0], message: '' });
			const canPM = context.checkCanPM(recipient, sender);
			assert.equal(canPM, true, 'friend should be able to PM in friends mode');
		});
	});

	describe('trusted mode (existing behavior)', () => {
		it('should block friends who are not trusted', () => {
			recipient = makeUser('Recipient');
			recipient.settings.blockPMs = 'trusted';
			recipient.friends = new Set([toID('FriendSender')]);

			sender = makeUser('FriendSender');

			const context = new Chat.CommandContext({ user: sender, room, connection: sender.connections[0], message: '' });
			const canPM = context.checkCanPM(recipient, sender);
			assert.equal(canPM, false, 'friend (not trusted) should not be able to PM in trusted mode');
		});

		it('should allow trusted users to PM', () => {
			recipient = makeUser('Recipient');
			recipient.settings.blockPMs = 'trusted';
			recipient.friends = new Set();

			sender = makeUser('TrustedSender');
			sender.autoconfirmed = toID('TrustedSender');
			sender.trusted = toID('TrustedSender');

			const context = new Chat.CommandContext({ user: sender, room, connection: sender.connections[0], message: '' });
			const canPM = context.checkCanPM(recipient, sender);
			assert.equal(canPM, true, 'trusted user should be able to PM in trusted mode');
		});
	});

	describe('edge cases', () => {
		it('should handle undefined friends list', () => {
			recipient = makeUser('Recipient');
			recipient.settings.blockPMs = 'trustedfriends';
			recipient.friends = undefined;

			sender = makeUser('TrustedSender');
			sender.autoconfirmed = toID('TrustedSender');
			sender.trusted = toID('TrustedSender');

			const context = new Chat.CommandContext({ user: sender, room, connection: sender.connections[0], message: '' });
			const canPM = context.checkCanPM(recipient, sender);
			assert.equal(canPM, true, 'trusted user should be able to PM even with undefined friends');
		});

		it('should handle empty friends list', () => {
			recipient = makeUser('Recipient');
			recipient.settings.blockPMs = 'trustedfriends';
			recipient.friends = new Set();

			sender = makeUser('RegularSender');

			const context = new Chat.CommandContext({ user: sender, room, connection: sender.connections[0], message: '' });
			const canPM = context.checkCanPM(recipient, sender);
			assert.equal(canPM, false, 'non-trusted non-friend should not be able to PM with empty friends list');
		});

		it('should normalize friend IDs', () => {
			recipient = makeUser('Recipient');
			recipient.settings.blockPMs = 'trustedfriends';
			recipient.friends = new Set([toID('FriendSender')]);

			sender = makeUser('friendsender'); // different casing

			const context = new Chat.CommandContext({ user: sender, room, connection: sender.connections[0], message: '' });
			const canPM = context.checkCanPM(recipient, sender);
			assert.equal(canPM, true, 'friend should be able to PM regardless of name casing');
		});
	});
});
