import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from "axios";

import reformulations from './reformulations';

const THOUGHT_COLLECTION = 'thought';
const RESPEAK_COLLECTION = 'respeak';
const REFORMULATIONS_COLLECTION = 'reformulations';

admin.initializeApp();

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function findThoughtsWithNoRespeaks() {
    const snapshot = await admin.firestore().collection(THOUGHT_COLLECTION).where('numRespeaks', '==', 0).get()
    return snapshot.docs;
}

function getOpenAIResponse(reformulationCommand, thoughtText) {
    return axios.post("https://api.openai.com/v1/engines/text-davinci-002/completions", {
        "prompt": `${reformulationCommand}\n\nThought: ${thoughtText}\n\n`,
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
    }).then(response => {
        return response.data.choices[0].text;
    }).catch(error => {
        console.log(error);
        return "";
    });
}

async function addRespeakFunc(thoughtId, reformulationId, respeakText, author) {
    const firestore = admin.firestore();

    const thought = firestore.collection(THOUGHT_COLLECTION).doc(thoughtId);
    const batch = firestore.batch();

    const newRespeak = thought.collection(RESPEAK_COLLECTION).doc();

    batch.create(newRespeak, {
        content: respeakText,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        owner: author,
        perspective: reformulationId,
        thought: thoughtId
    });

    batch.update(thought, {
        numRespeaks: admin.firestore.FieldValue.increment(1),
        notSeenRespeaks: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
}


export const openAIRespeak = functions.region("europe-west3").pubsub.schedule('* * * * *').onRun(async (context) => {

    // Print list of throughts without respeaks
    const thoughts = await findThoughtsWithNoRespeaks();
    const thoughtPromises = thoughts.map(async thought => {
        const thoughtData = thought.data();
        if (thoughtData.content === null || thoughtData.content.length === 0) return null;
        let reformulation = reformulations[randomInt(0, reformulations.length - 1)];

        const response = await getOpenAIResponse(reformulation.openai_command, thoughtData.content);
        if (response !== "") {
            console.log('Reformulation: ' + reformulation.openai_command);
            console.log('Thought: ' + thoughtData.content);
            console.log('Response: ' + response);
            await addRespeakFunc(thought.id, reformulation.name, response, 'openai');
        }

    });
    await Promise.all(thoughtPromises);
    return null
});

export const noteSeenRespeaks = functions.region("europe-west3").https.onCall(async (data, context) => {
    const seenRespeaks = data.seenRespeaks;
    const thoughtId = data.thoughtId;
    const firestore = admin.firestore();

    const uid = context.auth!.uid!;
    const thought = admin.firestore().collection(THOUGHT_COLLECTION).doc(thoughtId);
    firestore.runTransaction(async tx => {
        const thoughtDoc = await tx.getAll(thought);
        if (thoughtDoc.length === 0) {
            return;
        }

        const notSeenRespeaks = thoughtDoc[0].get("notSeenRespeaks");
        if (uid !== thoughtDoc[0].get("owner")) {
            return;
        }

        if (notSeenRespeaks - seenRespeaks < 0) {
            return;
        }

        tx.update(thought, { "notSeenRespeaks": notSeenRespeaks - seenRespeaks });
    });

    return "done";
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
