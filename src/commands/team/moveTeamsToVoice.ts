import { kMaxLength } from 'buffer';
import { GuildChannel, GuildMember, Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

import { Team, PlayerH, Player } from '../../db/models';

interface PromptArgs {
  teamId1: number;
  teamId2: number;
}

export default class MoveTeamsChannelCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'move-teams-to-channel',
      aliases: ['mttc', 'channel-move'],
      group: 'team',
      memberName: 'move-teams-to-channel',
      description: 'Moves teams into separate channels',
      argsCount: 2,
      args: [
        {
          key: 'teamId1',
          prompt: 'What is the ID of the first team',
          type: 'integer',
        },
        {
          key: 'teamId2',
          prompt: 'What is the ID of the second team',
          type: 'integer',
        },
      ],
    });
  }

  async run(msg: CommandoMessage, { teamId1, teamId2 }: PromptArgs) {
    const end = new Message(null, null, msg.channel);

    const team1 = await Team.findOne({ where: { id: teamId1 }, include: [{ all: true }] });
    const team2 = await Team.findOne({ where: { id: teamId2 }, include: [{ all: true }] });

    const ch1 = msg.guild.channels.cache.find((channel) => channel.name == 'General');
    const ch2 = msg.guild.channels.cache.find((channel) => channel.name == 'valo');

    const t1Players = [team1.playerId1, team1.playerId2, team1.playerId3, team1.playerId4, team1.playerId5];
    const t2Players = [team2.playerId1, team2.playerId2, team2.playerId3, team2.playerId4, team2.playerId5];

    // console.log('\n\n');
    // console.log(`'${teamId1}'`);
    // console.log(`'${teamId2}'`);
    // console.log('\n\n');

    await this.moveTeams(msg, t2Players, ch2);
    await this.moveTeams(msg, t1Players, ch1);
    msg.say('Finished moving teams');
    return end;
  }

  async moveTeams(msg: CommandoMessage, playerIdArr: number[], channel: GuildChannel): Promise<void> {
    for (const playerHId of playerIdArr) {
      const currPlayerH = await PlayerH.findOne({ where: { id: playerHId }, include: [{ all: true }] });

      let currPlayer: Player;
      if (currPlayerH != null) {
        currPlayer = await Player.findOne({ where: { id: currPlayerH.playerId }, include: [{ all: true }] });
      } else {
        msg.say(`No playerH with ID \`${playerHId}\` found`);
        continue;
      }

      let curUser: GuildMember;
      if (currPlayer != null) {
        curUser = msg.guild.members.cache.get(currPlayer.userId);
      } else {
        msg.say(`No player with ID \`${currPlayerH.playerId}\` found`);
        continue;
      }

      if (curUser != null) {
        await curUser.voice.setChannel(channel);
      } else {
        msg.say(`\`${currPlayer.userTag}\` could not be found on server`);
      }
    }
  }
}
