import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from "axios";

const THOUGHT_COLLECTION = 'thought';
const RESPEAK_COLLECTION = 'respeak';
const REFORMULATIONS_COLLECTION = 'reformulations';

admin.initializeApp();

async function findThoughtsWithNoRespeaks() {
  return await admin.firestore().collection(THOUGHT_COLLECTION).where('numRespeaks', '==', 0).get();
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


export const openAIRespeak = functions.region("europe-west3").https.onCall(async (data, context) => {
    const reformulation_name = data.reformulation_name;
    //Get thought document based on name
    const reformulation = await admin.firestore().collection(REFORMULATIONS_COLLECTION).doc(reformulation_name).get();
    if (!reformulation.exists) return { error: `Reformulation ${reformulation_name} does not exist` };

    // Print list of throughts without respeaks
    const thoughts = await findThoughtsWithNoRespeaks();
    thoughts.forEach(async thought => {
        const thoughtData = thought.data();
        if (thoughtData.content !== null && thoughtData.content.length > 0) {
            getOpenAIResponse(reformulation.data().openai_command, thoughtData.content).then(response => {
                if (response !== "") {
                    console.log('Reformulation: ' + reformulation.data().openai_command);
                    console.log('Thought: ' + thoughtData.content);
                    console.log('Response: ' + response);
                    addRespeakFunc(thought.id, reformulation.id, response, 'openai');
                }
            });
        }
        
    });    
    return
    const thoughtText = data.thoughtText;

    // const openaiPrompt
    if (reformulation.exists) {
        return await axios.post("https://api.openai.com/v1/engines/text-davinci-002/completions", {
            "prompt": `${reformulation.data().openai_command}\n\nThought: ${thoughtText}\n\n`,
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
            return res.data.choices[0].text;
        });
    } else {
        return "Reformulation not found";
    }
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
