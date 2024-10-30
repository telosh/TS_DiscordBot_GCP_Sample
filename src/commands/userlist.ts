import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

const command = {
	data: new SlashCommandBuilder()
		.setName('userlist')
		.setDescription('testサーバーの人数統計表を表示します'),
    async execute(interaction :  ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply('このコマンドはサーバー内でのみ使用できます。');
            return;
        }
        const bots = interaction.guild.members.cache.filter(member => member.user.bot);

        const botCount = bots.size;
        const botList = bots.map(bot => bot.user.tag).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('サーバーの人数統計表')
            .addFields(
                { name: 'メンバー', value: `合計 ${interaction.guild.memberCount} 人`, inline: true },
                { name: 'Bot', value: `合計 ${botCount} 人\n${botList}`, inline: true },
            );

        if (interaction.channel) {
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply('チャンネルが見つかりませんでした。');
        }
    },
};

export default command;