require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
// bot.onText(/\/echo (.+)/, (msg, match) => {
//     // 'msg' is the received Message from Telegram
//     // 'match' is the result of executing the regexp above on the text content
//     // of the message

//     const chatId = msg.chat.id;
//     const resp = match[1]; // the captured "whatever"

//     // send back the matched "whatever" to the chat
//     bot.sendMessage(chatId, resp);
// });

// Listen for any kind of message. There are different kinds of
// messages.

const DB = {
    gm_chat_id: null,
    invited_ids: [],
};

/**
 *
 * @param {string} nickname
 */
function sendToGM(nickname) {
    DB.gm_chat_id !== null &&
        bot.sendMessage(DB.gm_chat_id, `Ник: ${nickname}`);
}

/**
 *
 * @param {number} chat_id
 * @param {string} msg
 */
function sendMsgTo(chat_id, msg) {
    bot.sendMessage(chat_id, msg);
}

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const msgText = msg.text;

    // /start or /help
    if (msgText.includes("/start") || msgText.includes("/help")) {
        sendMsgTo(
            chatId,
            `Чтобы оставить ник введите его через пробел после команды \n /nick ваш_ник`
        );

        return;
    }

    // /gm_code <string>
    if (DB.gm_chat_id === null && msgText.includes("/gm_code")) {
        let gm_code = null;

        if (msgText.split(" ").length <= 1) {
            sendMsgTo(chatId, `Введите код после команды /gm_code.`);
            return;
        }

        // get code from msg & check it
        gm_code = msgText.split(" ")[1];

        if (gm_code === "testing") {
            DB.gm_chat_id = msg.chat.id;
            sendMsgTo(
                chatId,
                `Успешно! Теперь вам будут приходить в чат ники.`
            );
        } else {
            sendMsgTo(chatId, `Incorrect code.`);
        }

        return;
    }

    // check for gm person
    if (DB.gm_chat_id === null) return;

    // /nickname <string>
    if (msgText.includes("/nick")) {
        // new person and not a gm person
        if (!DB.invited_ids.includes(chatId) && DB.gm_chat_id !== chatId) {
            // nick null
            if (msgText.split(" ").length <= 1) {
                sendMsgTo(
                    chatId,
                    `Введите ник через пробел после команды /nick.`
                );
                return;
            }
            // add to invited ids the person's chat id
            DB.invited_ids.push(chatId);

            // get user nickname
            const user_nickname = msgText.split(" ")[1];

            // send to gm the nickname
            DB.gm_chat_id !== null && sendToGM(user_nickname);

            // send accept message to user
            sendMsgTo(
                chatId,
                `Мы получили ваш ник: "${user_nickname}", ждите пока вас примут в гильдию.`
            );

            return;
        }

        // gm person
        if (chatId === DB.gm_chat_id) {
            sendMsgTo(chatId, `Вы не можете пригласить самого себя.`);

            return;
        }

        // old person
        if (DB.invited_ids.includes(chatId)) {
            sendMsgTo(chatId, `Ваш ник уже ранее был отправлен в гильдию.`);

            return;
        }
    }

    // everything else
    sendMsgTo(chatId, "Нету такой команды. Введите /help для списка команд.");
});
