import { Collection, Events, REST, Routes } from 'discord.js';
import CustomClient from '../../base/classes/CustomClient';
import Event from '../../base/classes/Event';
import Command from '../../base/classes/Command';

export default class Ready extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.ClientReady,
            description: 'Ready Event',
            once: true
        });
    }

    async Execute() {
        console.log(`${this.client.user?.username}#${this.client.user?.discriminator} is online!`);

        const clientId = this.client.developmentMode ? this.client.config.devDiscordClientId : this.client.config.discordClientId;
        const rest = new REST({ version: '10' }).setToken(this.client.config.token);

        if(!this.client.developmentMode) {
            const globalCommands: any = await rest.put(Routes.applicationCommands(clientId), {
                body: this.GetJson(this.client.commands.filter(command => !command.dev))
            });

            console.log(`Successfully loaded ${globalCommands.length} global application (/) commands.`);
        }

        const devCommands: any = await rest.put(Routes.applicationGuildCommands(clientId, this.client.config.devGuildId), {
            body: this.GetJson(this.client.commands.filter(command => command.dev))
        });

        console.log(`Successfully loaded ${devCommands.length} developer application (/) commands.`);
    }

    private GetJson(commands: Collection<string, Command>): object[] {
        const data: object[] = [];

        commands.forEach(command => {
            data.push({
                name: command.name,
                description: command.description,
                options: command.options,
                default_member_permission: command.default_member_permission.toString(),
                dm_permission: command.dm_permission,
            })
        });

        return data;
    }
}