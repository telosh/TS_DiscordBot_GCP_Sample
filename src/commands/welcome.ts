import { SlashCommandBuilder, ButtonBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonStyle } from 'discord.js';

const command = {
	data: new SlashCommandBuilder()
		.setName('welcome')
		.setDescription('初見さん用のボタンを送信します。'),
    async execute(interaction : ChatInputCommandInteraction) {
        // ここにコマンドの処理を記述します
        // buttonを送信する
        const button = new ButtonBuilder()
            .setLabel('ボタン')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('welcome_button');

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        await interaction.reply({ content: '鯖初見の人はまずこれ押してね', components: [actionRow] });
        
    },
};

export default command;