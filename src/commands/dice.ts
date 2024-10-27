import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

const command = {
	data: new SlashCommandBuilder()
		.setName('dice')
		.setDescription('サイコロを振ります')
		.addIntegerOption(option => 
			option.setName('個数')
			.setDescription('サイコロを振る個数を指定してください')
			.setRequired(false) // 個数指定を必須にしない
		),
	async execute(interaction: ChatInputCommandInteraction) {
		// デフォルト値は1、指定があればその値を使う
		const diceCount = interaction.options.getInteger('個数') || 1;
		const diceResult = [];

		// サイコロを振る
		for (let i = 0; i < diceCount; i++) {
			diceResult.push(Math.floor(Math.random() * 6) + 1);
		}

		// 結果をEmbedで表示
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle('サイコロの結果')
			.setDescription(`サイコロを${diceCount}回振りました！`)
			.addFields([{ name: '結果', value: diceResult.join(', '), inline: true }]);

		await interaction.reply({ embeds: [embed] });
	},
};

export default command;
