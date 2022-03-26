import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from "axios";

const THOUGHT_COLLECTION = 'thought';
const RESPEAK_COLLECTION = 'respeak';

admin.initializeApp();

export const openAIRespeak = functions.region("europe-west3").https.onCall(async (data, response) => {
    const thoughtText = data.thoughtText;
    // const openaiPrompt
    // axios request
    const res = await axios.post("https://api.openai.com/v1/engines/text-davinci-edit-001/edits", {
        "prompt": `Identify some patterns and exaggerations in this thought and assumptions the subject made without reason.\n\nThought: "${thoughtText}"\n\n`,
        "temperature": 0.7,
        "max_tokens": 182,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + functions.config().openai.key
        }
    }).then(res => {
        console.log(res.data);
        return res.data.choicesp[0].text;
    });
});

export const addThought = functions.region("europe-west3").https.onCall(async (data, context) => {
    await admin.firestore().collection(THOUGHT_COLLECTION).add(
        {
            owner: context.auth!.uid,
            content: data.content,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            numRespeaks: 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            notSeenRespeaks: 0,
        },
    );

    return "done";
});

export const addRespeak = functions.region("europe-west3").https.onCall(async (data, context) => {
    const firestore = admin.firestore();
    const thoughtId = data.thoughtId;

    const thought = firestore.collection(THOUGHT_COLLECTION).doc(thoughtId);
    const batch = firestore.batch();

    const newRespeak = thought.collection(RESPEAK_COLLECTION).doc();
    batch.create(newRespeak, {
        content: data.content,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        owner: context.auth!.uid,
        perspective: data.perspective
    });

    batch.update(thought, {
        numRespeaks: admin.firestore.FieldValue.increment(1),
        notSeenRespeaks: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
    return "done";
});
