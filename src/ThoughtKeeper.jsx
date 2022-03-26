import { useEffect, useState } from 'react';
import { WaitingThoughtsContext } from './context';
import { THOUGHT_COLLECTION, firestore, signIn } from './firebaseUtils';
import { orderBy, query, limit, onSnapshot, collection } from 'firebase/firestore';


const ThoughtKeeper = ({children}) => {
  const [waitingThoughts, setWaitingThoughts] = useState([]);

  useEffect(() => {
    const f = async () => {
      await signIn();
      onSnapshot(
        query(
          collection(firestore, THOUGHT_COLLECTION),
          orderBy("numRespeaks", "asc"),
          orderBy("updatedAt", "asc"),
          limit(20)
        ),
        (snapshot) => {
          setWaitingThoughts(thoughts => {
            const sequence = thoughts.map(thought => thought.id);
            
            const currentThoughts = Object.fromEntries(
              thoughts.map(thought => [thought.id, thought]));
              
            const newThoughts = [];
            
            snapshot.docChanges().forEach((change) => {
              console.log(change);

              if (change.type === 'added') {
                newThoughts.push(Object.assign({},
                                               {"id": change.doc.id},
                                               change.doc.data()));
                console.log(newThoughts);
              }
              if (change.type === 'modified') {
                currentThoughts[change.doc.id] = Object.assign({},
                                                               {"id": change.doc.id},
                                                               change.doc.data());
              }
              if (change.type === 'delete') {
                delete currentThoughts[change.doc.id];
              }
            });

            while (newThoughts.length < 10 && sequence.length > 0) {
              const next = sequence.shift();
              if (currentThoughts[next]) {
                newThoughts.push(currentThoughts[next]);
              }
            }
            console.log(newThoughts);
            return newThoughts;
          });
        });
    };
    f();
  }, []);

  return (<WaitingThoughtsContext.Provider value={waitingThoughts}>
            {children}
          </WaitingThoughtsContext.Provider>);
}

export default ThoughtKeeper;
