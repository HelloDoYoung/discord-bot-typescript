import { ChatInputCommandInteraction, Collection, EmbedBuilder, Events } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";

export default class CommandHandler extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.InteractionCreate,
            description: 'Command Handler Event',
            once: false
        });
    }

    Execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const command: Command = this.client.commands.get(interaction.commandName)!;

        // @ts-ignore
        if (!command) return interaction.reply({ embeds: [new EmbedBuilder()
            .setColor("Red")
            .setDescription(`❌ 해당 명령어는 존재하지 않습니다.`)
        ], ephemeral: true }) && this.client.commands.delete(interaction.commandName);

        if (command.dev && !this.client.config.developerUserIds.includes(interaction.user.id))
            return interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`❌ 개발 중인 명령어로 사용하실 수 없습니다.`)
            ], ephemeral: true });
        const { cooldowns } = this.client;
        if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection());

        const now = Date.now();
        const timestamps = cooldowns.get(command.name)!;
        const cooldownAmount = (command.cooldown) * 1000;

        if (timestamps.has(interaction.user.id) && (now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount))
            return interaction.reply({ embeds: [new EmbedBuilder()
            .setColor("Red")
            .setDescription(`❌ \`${command.name}\` 명령어를 다시 사용하기 위해서 \`${((((timestamps.get(interaction.user.id) || 0) + cooldownAmount) - now) / 1000).toFixed(1)}\`초를 기다려주세요.`)
            ], ephemeral: true });

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            const SubCommandGroup = interaction.options.getSubcommandGroup(false);
            const SubCommand = `${interaction.commandName}${SubCommandGroup ? `.${SubCommandGroup}` : ''}.${interaction.options.getSubcommand(false) || ""}`;

            return this.client.subCommands?.get(SubCommand)?.Execute(interaction) || command.Execute(interaction);
        } catch (error) {
            console.log(error);
        }
    }
}