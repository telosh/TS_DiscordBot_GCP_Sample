import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js';
import { InstancesClient } from '@google-cloud/compute';
const projectId = 'minecraft-server-telosh';
const zone = 'us-central1-a';
const instace = 'test-instance';

const stopServerCommand = {
    data: new SlashCommandBuilder()
        .setName('stop-server')
        .setDescription('Start the VM instance'),
    async execute(interaction: CommandInteraction) {
        const computeClient = new InstancesClient();
        const request = {
            project: projectId,
            zone: zone,
            instance: instace,
        }

        try {
            const response = await computeClient.start(request);
            console.log('VM Stoped:', response);
            const embed = new EmbedBuilder()
                .setTitle('VM Stoped')
                .setDescription('VMの停止に成功しました。')
                .setColor('#00FF00');
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('VM stop failed:', error);
            const embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`VMの停止に失敗しました。`)
                .setColor('#FF0000');
            await interaction.reply({ embeds: [embed] });
        }
    },
};

export default stopServerCommand;