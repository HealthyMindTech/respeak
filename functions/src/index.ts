import * as functions from 'firebase-functions';
import axios from "axios";

exports.helloWorld = functions.https.onRequest(async (request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    // axios request
    const res = await axios.post("https://api.openai.com/v1/engines/text-davinci-edit-001/edits", {
        input: "I woke up at 11:30 in the morning and fell back asleep until 2:00 PM. The night before I laid in bed watching something on Netflix, I can’t remember now. The past week is a haze. I’ve barely had any energy to get out of bed, let alone do anything productive. Today I managed to make myself some breakfast and that’s the biggest victory I’ve had in the last three days. I have to go to work soon and I’m dreading it. It means having to get a shower, it means having to be around people and interact with them for longer than a few seconds. I already know that as soon as I get home I won’t make dinner, I won’t do anything but lay on my couch for a few hours until I’m tired enough to fall asleep. And this is how I’ve been for months. This is what it’s like to live with depression.\n\n",
        instruction: "Rewrite this from a more positive point of view.",
        temperature: 0.7,
        top_p: 1,
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + functions.config().openai.key
        }
    }).then(res => {
        console.log(res.data);
        response.send(res.data.choicesp[0].text);
    });
});
