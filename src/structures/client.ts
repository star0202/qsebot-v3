import { CommandClient } from '@pikokr/command.ts'
import Discord, { ActivitiesOptions, Intents, IntentsString } from 'discord.js'
import { config } from '../config'
import { Logger } from 'tslog'
import { QseCoolDownAdapter } from './QseCoolDownAdapter'

const messages: ActivitiesOptions[] = [
  {
    name: `${config.prefix}밥`,
    type: 'PLAYING',
  },
  {
    name: `${config.prefix}가위바위보`,
    type: 'PLAYING',
  },
  {
    name: `${config.prefix}승률`,
    type: 'WATCHING',
  },
  {
    name: `${config.prefix}퀴즈`,
    type: 'PLAYING',
  },
  {
    name: '큐세 유튜브',
    type: 'WATCHING',
  },
]

export class Client extends CommandClient {
  constructor(logger: Logger) {
    super({
      client: new Discord.Client({
        intents: Object.keys(Intents.FLAGS) as IntentsString[],
        partials: ['GUILD_MEMBER', 'CHANNEL', 'MESSAGE', 'USER', 'REACTION'],
      }),
      owners: 'auto',
      command: {
        prefix: config.prefix,
        check: (msg) => {
          if (!msg.guild) return false
          if (msg.member?.permissions.has('ADMINISTRATOR')) return true
          if (this.owners.includes(msg.author.id)) return true
          return !!config.commandChannels.includes((msg.channel.isThread() && msg.channel.parentId) || msg.channelId)
        },
      },
      applicationCommands: {
        autoSync: true,
        guild: config.slash.guild,
      },
      coolDownAdapter: new QseCoolDownAdapter(),
    })

    this.logger = logger

    this.registry.loadModulesIn('modules')

    this.client.once('ready', () => {
      let i = 0
      setInterval(() => {
        if (!messages[i]) {
          i = 0
        }

        const item = messages[i]

        this.client.user?.setPresence({
          activities: [item],
        })

        i++
      }, 10000)
    })
  }
}
