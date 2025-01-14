import { listener, Module } from '@pikokr/command.ts'
import { GuildMember, Message, TextChannel, TextBasedChannel } from 'discord.js'
import { getPinRole } from '../utils/roles'

class Pin extends Module {
  @listener('channelPinsUpdate')
  async pin(channel: TextBasedChannel) {
    if (!(channel instanceof TextChannel)) return
    const channels: TextChannel[] = channel.guild.channels.cache.filter((x) => x.type === 'GUILD_TEXT').map((x) => x as TextChannel)
    const allMessages: Message[][] = await Promise.all(channels.map(async (x) => (await x.messages.fetchPinned(true)).map((x) => x)))

    const pins = new Set<GuildMember>()

    for (const channel of allMessages) {
      for (const msg of channel) {
        if (!msg.member) continue
        pins.add(msg.member)
      }
    }

    const role = await getPinRole()

    for (const pin of pins) {
      if (!pin.roles.cache.has(role.id)) {
        await pin.roles.add(role)
      }
    }

    for (const [, member] of channel.guild.members.cache) {
      if (!pins.has(member)) {
        await member.roles.remove(role)
      }
    }
  }
}

export function install() {
  return new Pin()
}
