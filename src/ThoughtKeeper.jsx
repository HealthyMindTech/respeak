import { useEffect, useState } from 'react';
import { MyThoughtsContext, WaitingThoughtsContext } from './context';
import { THOUGHT_COLLECTION, auth, firestore, signIn } from './firebaseUtils';
import { orderBy, where, query, limit, onSnapshot, collection } from 'firebase/firestore';


const ThoughtKeeper = ({children}) => {
  const [waitingThoughts, setWaitingThoughts] = useState([]);
  const [myThoughts, setMyThoughts] = useState([]);
  
  useEffect(() => {
    const f = async () => {
      await signIn();

      onSnapshot(
        query(
          collection(firestore, THOUGHT_COLLECTION),
          where("owner", "==", auth.currentUser.uid),
          orderBy("updatedAt", "asc"),
        ),
        (snapshot) => {
          setMyThoughts(thoughts => {
            const output = [...thoughts];
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                output.unshift(Object.assign({},
                                             {id: change.doc.id},
                                             change.doc.data()));
              }
              if (change.type === "modified") {
                output.splice(change.oldIndex, 1);
                output.splice(change.newIndex,
                              0,
                              Object.assign({},
                                            {id: change.doc.id},
                                            change.doc.data())
                             );
              }
            });
            return output;
          });
        }
      );
        
      onSnapshot(
        query(
          collection(firestore, THOUGHT_COLLECTION),
          orderBy("numRespeaks", "asc"),
          orderBy("updatedAt", "desc"),
          limit(20)
        ),
        (snapshot) => {
          setWaitingThoughts(thoughts => {
            const sequence = thoughts.map(thought => thought.id);
            
            const currentThoughts = Object.fromEntries(
              thoughts.map(thought => [thought.id, thought]));
              
            const newThoughts = [];
            
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                newThoughts.push(Object.assign({},
                                               {"id": change.doc.id},
                                               change.doc.data()));
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
            return newThoughts;
          });
        });
    };
    f();
  }, []);

  return (
    <MyThoughtsContext.Provider value={myThoughts}>
      <WaitingThoughtsContext.Provider value={waitingThoughts}>
        {children}
      </WaitingThoughtsContext.Provider>
    </MyThoughtsContext.Provider>
  );
}

export default ThoughtKeeper;
