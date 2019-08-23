// Command category created by bag/ Ruixel @ github
// Allows for polling via the use of reactions
// Types of polls:
// - Yes / No
// - Option-based (1, 2, 3, 4)
const CommandHandler = require('./command_handler');

// Number emojis
const NUM_EMOJIS = [
    '1⃣', '2⃣', '3⃣', '4⃣', '5⃣', 
    '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

module.exports = class PollCommandHandler extends CommandHandler {
    constructor() {
        super('poll');
        super.addCommand(
            "yesno", 
            "Poll yes/no style questions",
            ">poll yesno Should I go out tonight?",
            pollYesno
        )
        .addCommand(
            "options", 
            "Poll questions with options",
            '>poll options "Question here" optionA optionB',
            pollOptions
        );
    }
}

function createHopsonPollingStationEmbed(channel, value) {
    return channel.send({embed: {
        color: 3447003,
        fields: [{
            name: "*Hopson Polling Station*",
            value: value
        }]
    }});
}

/**
 * Sends a poll message for a yes/no question
 * @param {Discord message} message The raw discord message
 * @param {[String]} args List of string, the command arguments
 */
function pollYesno(message, args) {
    const question = args.join(" ");
    if (question == "" || question == " ") {
        createHopsonPollingStationEmbed(message.channel, "Please add a question.");
        return;
    }
    
    createHopsonPollingStationEmbed(message.channel, question)
        .then(message => {
            message.react("✅");

            // Small delay so the cross always comes last
            setTimeout(_ => {
                message.react("❌")
            }, 1000);
    });
}

/**
 * Sends a poll message for a question with multiple options
 * @param {Discord message} message The raw discord message
 * @param {[String]} args List of string, the command arguments
 */
function pollOptions(message, args) {
    // Make sure there's at least two choises
    const channel = message.channel;

    if (!passesTest(args.length < 1, 'Not enough known to create a poll, please provide a question with options eg `">poll option "How many stars is my food?" 1 2 3 4 5"`', channel)) {
        return;
    }
    if (!passesTest(!args[0].startsWith("\""), 'Unable to poll! The question should be wrapped between two " characters.', channel)) {
        return;
    }
    
    //Extract question
    let question = "";
    let full = args.join(" ").slice(1)
    let isQuestion = false;
    for (const c of full) {
        full = full.slice(1);
        if (c === "\"") {
            isQuestion = true;
            break;
        }
        question += c;
    }

    if (!passesTest(!isQuestion, 'The question should be wrapped between two " characters.', channel)) {
        return;
    }

    //Extract options
    const options = full
        .split(/(\s+)/)
        .filter(v => v != ' ' && v != '');

    if (!passesTest(options.length < 2, 'At least 2 options must be provided.', channel)) {
        return;
    }

    //Add options to the outputted text
    let fieldText = question;
    for (const option in options) {
        fieldText += `\nTo answer with ${options[option]}, react with ${NUM_EMOJIS[option]}`
    }

    //Fire the question
    createHopsonPollingStationEmbed(message.channel, fieldText)
        .then(message => {
            for (const option in options) {
                delayedReactWithNumber(message, option);
            }
        });
}

function passesTest(test, errorMessage, channel) {
    if (!test) {
        createHopsonPollingStationEmbed(
            channel, 
            'Unable to poll! At least 2 options must be provided.'
        );
        return false;
    }
    else {
        return true;
    }
}

function delayedReactWithNumber(message, n)
{
    // 0.5s timeout seems to be the best when theres a large number of options
    setTimeout(function() {
        message.react(NUM_EMOJIS[n]);
    }, 500*n);
}