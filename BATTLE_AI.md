# Battle AI Challenge System

## Overview

The Battle AI Challenge System allows users to test their Pokémon battling skills against an automated AI opponent. This system implements a floor-based progression where users advance through increasingly difficult challenges.

## Features

### Command: `/playertest`

Starts a battle against an AI opponent. The battle will:
- Display as "**User** vs **Battle Tower Trainer**" at the top
- Use random team generation for both players
- The AI opponent is hidden from user lists
- The AI makes decisions automatically with a slight delay (0.5-1.5 seconds) to simulate thinking

### Floor Progression System

Users progress through floors by defeating the AI:
- **Floor 1-3**: Gen 9 Random Battle format
- **Floor 4-6**: Gen 9 OU (OverUsed) format
- **Floor 7-10**: Gen 9 Ubers format
- **Floor 11+**: Gen 9 Anything Goes format

When you win a battle, you advance to the next floor. If you lose, you stay on the same floor and can try again.

### Additional Commands

- `/playertestfloor` or `/playertestprogress` - Check your current floor progress
- `/playertestrest [user]` - (Admin only) Reset a user's Battle AI progress

## AI Behavior

The AI opponent:
- Named dynamically as "AI 1", "AI 2", etc., based on the current floor
- Makes random move selections from available moves
- Switches when necessary (forced switches or no moves available)
- Uses default team preview ordering
- Does not appear in the battle room's user list
- Is automatically cleaned up after the battle ends

## Technical Implementation

### Components

1. **AIRequestHandler**: Intercepts battle requests sent to the AI player and makes automatic decisions
2. **Progress Tracking**: Stores user progress in `config/battle-ai-progress.json`
3. **AI User Creation**: Creates temporary user objects that don't appear in normal user lists
4. **Battle Integration**: Hooks into the battle system to handle win/loss outcomes

### File Location

`server/chat-plugins/battle-ai.ts`

## Usage Example

```
/playertest
```

This will:
1. Create a battle against an AI opponent
2. Generate random teams for both players
3. Start the battle in the standard Pokémon Showdown battle UI
4. Track your progress automatically

## Future Enhancements

Possible improvements for the future:
- More intelligent AI decision-making (type matchups, strategy)
- Different AI personalities or strategies per floor
- Team preview customization
- Special challenges or boss battles
- Rewards or achievements system
- Leaderboards for fastest clears or highest floors reached
