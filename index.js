const Alice = require('yandex-dialogs-sdk');
const alice = new Alice();
const aliceItemCard = require('yandex-dialogs-sdk/dist/card');
const imageIds = require('./image-ids.js');
const taskGenerator = require('./task-generator.js');

const sessionsData = {};

const characters = {
    dog: ['щенок', 'собака', 'собачка', 'щеночек', 'пес', 'песик'],
    cat: ['котенок', 'кот', 'котик', 'кошка', 'кошечка', 'котеночек', 'киска'],
    pig: ['поросенок', 'свинка', 'свинья', 'свинюшка', 'поросеночек', 'хрюшка']
    //cow: ['коровка', 'корова', 'теленок', 'бык', 'бычек']
};

const allCharactersNames = [...characters.dog, ...characters.cat, ...characters.pig/*, ...characters.cow*/];
console.log(allCharactersNames);

const { loggingMiddleware, button } = Alice;


function createTaskReply(task, ctx, previus) {
    const prev = typeof previus !== 'undefined'
        ? (previus ? "Верно! Следующее задание. ": "Ты ошибся. Другое задание.")
        : '';

    const reply = ctx.replyBuilder
        .text(`Назови персонажа`)
        .tts(`${prev}. Кто держит цифру ${task.right.value}`)
        .get();

    reply.response.card = {
        type: "ItemsList",
        items: task.variants.map((variant) =>
            aliceItemCard.image({
                image_id: imageIds[`table-${variant.character}-${variant.value}`],
                title: characters[variant.character][0]
            })
        )
    };

    return reply;
}

alice.use(loggingMiddleware({
    level: 1 // Optional. DEFAULT 0. see https://github.com/pimterry/loglevel
}));

alice.welcome(async (ctx) => {
    return ctx.reply('Привет! Я могу помочь тебе выучить цифры. Что бы начать, скажи "Давай учить цифры"');
});

alice.command(['давай учить цифры', 'начинаем', 'поехали'], (ctx) => {
    const task = taskGenerator(Object.keys(characters));

    if (typeof sessionsData[ctx.sessionId] === 'undefined') {
        sessionsData[ctx.sessionId] = {}
    }

    sessionsData[ctx.sessionId] = {
        date: new Date(),
        task: task
    };

    return ctx.reply(createTaskReply(task, ctx));
});

allCharactersNames.forEach((charName) => {
    alice.command(charName, (ctx) => {
        console.log("==>", charName);

        if (typeof sessionsData[ctx.sessionId] !== 'undefined' && sessionsData[ctx.sessionId].task) {
            const task = sessionsData[ctx.sessionId].task;
            console.log(sessionsData[ctx.sessionId]);

            const namedChar = Object.keys(characters).reduce((acc, char) => {
                if (acc) {
                    return acc;
                }

                if (characters[char].includes(charName)) {
                    return char;
                }

                return acc;
            }, false);

            console.log(ctx.sessionId, task, namedChar);

            const newTask = taskGenerator(Object.keys(characters));
            const reply = createTaskReply(newTask, ctx, task.right.character === namedChar);


            sessionsData[ctx.sessionId] = {
                date: new Date(),
                task: newTask
            };

            console.log(sessionsData[ctx.sessionId]);

            return ctx.reply(reply);

        }

        return ctx.reply("Мы еще не начали. Скажи \"Начинаем\", что бы играть");
    });
})




alice.any(async (ctx) => {


    return ctx.reply("Моя тебя не понимать");
});

alice.listen('/alice/', process.env.QLOUD_HTTP_PORT || 4002);
